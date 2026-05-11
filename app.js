const config = require('./config/env')
const syncManager = require('./services/sync-manager')
const dataService = require('./services/data-service')
const { STORAGE_KEYS } = require('./constants/storage')

App({
  globalData: {
    userInfo: null,
    openid: null,
    isOnline: true,
    lastSyncTime: null,
    cloudReady: false,
    isSyncing: false
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      this.globalData.cloudReady = false
    } else {
      try {
        wx.cloud.init({
          env: config.cloudEnv,
          traceUser: config.traceUser
        })
        this.globalData.cloudReady = true
      } catch (err) {
        console.error('云初始化失败:', err)
        this.globalData.cloudReady = false
      }
    }

    this.getOpenId()
    this.restoreProfile()
    this.monitorNetwork()
  },

  async getOpenId() {
    if (!this.globalData.cloudReady) {
      console.log('云服务未就绪，跳过获取openid')
      return
    }

    try {
      const res = await Promise.race([
        wx.cloud.callFunction({ name: 'login' }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), config.timeout)
        )
      ])
      this.globalData.openid = res.result.openid
      console.log('获取openid成功')
    } catch (err) {
      console.log('获取openid失败（将使用本地模式）:', err.message || err)
    }
  },

  restoreProfile() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
    }
  },

  async setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)

    if (this.globalData.openid) {
      await this.saveUserToCloud(userInfo)
    }
  },

  async saveUserToCloud(userInfo) {
    if (!this.globalData.cloudReady || !this.globalData.openid) {
      console.log('云服务未就绪或openid未获取，跳过云端保存')
      return
    }

    try {
      const db = wx.cloud.database()
      const usersCollection = db.collection('users')

      const { data } = await Promise.race([
        usersCollection.where({ _openid: this.globalData.openid }).get(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), config.timeout)
        )
      ])

      if (data.length > 0) {
        await usersCollection.doc(data[0]._id).update({
          data: { ...userInfo, updateTime: new Date() }
        })
      } else {
        await usersCollection.add({
          data: { ...userInfo, createTime: new Date(), updateTime: new Date() }
        })
      }
      console.log('用户信息保存到云端成功')
    } catch (err) {
      console.log('保存用户信息到云端失败（已降级为本地存储）:', err.message || err)
    }
  },

  monitorNetwork() {
    wx.getNetworkType({
      success: (res) => {
        this.globalData.isOnline = res.networkType !== 'none'
      }
    })

    wx.onNetworkStatusChange((res) => {
      const wasOffline = !this.globalData.isOnline
      this.globalData.isOnline = res.isConnected

      if (res.isConnected && wasOffline) {
        this.autoSync()
      }
    })
  },

  async autoSync() {
    console.log('网络恢复，开始自动同步...')
    try {
      await this.syncData()
    } catch (err) {
      console.error('[App] 自动同步失败', err)
    }
  },

  async syncData() {
    if (!this.globalData.isOnline || !this.globalData.cloudReady || this.globalData.isSyncing) return

    this.globalData.isSyncing = true
    try {
      const results = await syncManager.syncAll()
      this.globalData.lastSyncTime = new Date()
      wx.setStorageSync(STORAGE_KEYS.LAST_SYNC_TIME, this.globalData.lastSyncTime.toISOString())
      dataService.clearAllCache()

      wx.showToast({ title: `同步完成 (${results.offlineQueue} 条离线操作已同步)`, icon: 'success', duration: 2000 })
      return results
    } catch (err) {
      console.error('[App] 同步失败', err.message || err)
      wx.showToast({ title: '同步失败', icon: 'none' })
      throw err
    } finally {
      this.globalData.isSyncing = false
    }
  },

  getSyncStatus() {
    return {
      isOnline: this.globalData.isOnline,
      isSyncing: this.globalData.isSyncing,
      lastSyncTime: this.globalData.lastSyncTime || wx.getStorageSync(STORAGE_KEYS.LAST_SYNC_TIME) || null,
      offlineQueueSize: syncManager.getOfflineQueueSize()
    }
  },

  pushToCloud(operation) {
    return syncManager.pushToCloud(operation)
  }
})
