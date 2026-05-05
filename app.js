App({
  globalData: {
    userInfo: null,
    openid: null,
    isOnline: true,
    lastSyncTime: null,
    cloudReady: false
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      this.globalData.cloudReady = false
    } else {
      try {
        wx.cloud.init({
          env: 'cloudbase-d5g760x9h5cd4938d',
          traceUser: false
        })
        this.globalData.cloudReady = true
      } catch (err) {
        console.error('云初始化失败:', err)
        this.globalData.cloudReady = false
      }
    }

    this.restoreProfile()
    this.monitorNetwork()

    setTimeout(() => {
      this.getOpenId()
    }, 1000)
  },

  async getOpenId() {
    if (!this.globalData.cloudReady) {
      console.log('云服务未就绪，跳过获取openid')
      return
    }

    try {
      const res = await Promise.race([
        wx.cloud.callFunction({
          name: 'login'
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 5000)
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
        usersCollection.where({
          _openid: this.globalData.openid
        }).get(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 5000)
        )
      ])

      if (data.length > 0) {
        await usersCollection.doc(data[0]._id).update({
          data: {
            ...userInfo,
            updateTime: new Date()
          }
        })
      } else {
        await usersCollection.add({
          data: {
            ...userInfo,
            createTime: new Date(),
            updateTime: new Date()
          }
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
    await this.syncData()
  },

  async syncData() {
    if (!this.globalData.isOnline || !this.globalData.cloudReady) return

    try {
      const db = wx.cloud.database()

      const localMedications = wx.getStorageSync('medications') || []
      const localReminders = wx.getStorageSync('reminders') || []

      if (localMedications.length > 0) {
        const { data: cloudMeds } = await Promise.race([
          db.collection('medications').limit(100).get(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
          )
        ])
        wx.setStorageSync('medications', cloudMeds)
      }

      if (localReminders.length > 0) {
        const { data: cloudRem } = await Promise.race([
          db.collection('reminders').limit(100).get(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
          )
        ])
        wx.setStorageSync('reminders', cloudRem)
      }

      this.globalData.lastSyncTime = new Date()
      wx.setStorageSync('lastSyncTime', this.globalData.lastSyncTime.toISOString())

      wx.showToast({ title: '同步完成', icon: 'success', duration: 1500 })
    } catch (err) {
      console.log('同步失败（使用本地数据）:', err.message || err)
    }
  },

  getSyncStatus() {
    return {
      isOnline: this.globalData.isOnline,
      lastSyncTime: this.globalData.lastSyncTime || wx.getStorageSync('lastSyncTime') || null
    }
  },

})
