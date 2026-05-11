const app = getApp()
const util = require('../../utils/util.js')
const dataService = require('../../services/data-service')

Page({
  data: {
    userName: '用户',
    currentDate: '',
    todayReminders: [],
    lowStockMedications: [],
    stats: {
      todayCount: 0,
      takenCount: 0,
      compliance: 0,
      streak: 0
    },
    isLoading: true,
    showGuide: false
  },

  onLoad() {
    this.initPage()
  },

  onShow() {
    this.loadData()
  },

  initPage() {
    try {
      this.setCurrentDate()
      this.setUserName()
      this.setData({ isLoading: false })
    } catch (e) {
      console.log('initPage error:', e)
      this.setData({ isLoading: false })
    }
    
    this.loadData()
  },

  setCurrentDate() {
    try {
      const now = new Date()
      const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
      this.setData({ currentDate: dateStr })
    } catch (e) {
      this.setData({ currentDate: '今天' })
    }
  },

  setUserName() {
    try {
      if (app && app.globalData && app.globalData.userInfo) {
        this.setData({ userName: app.globalData.userInfo.nickName || '用户' })
      }
    } catch (e) {
      console.log('setUserName error:', e)
    }
  },

  loadData() {
    this.loadTodayReminders()
    this.loadStreak()
    this.loadStats()
    this.checkFirstTime()
    const isSubscribed = wx.getStorageSync('subscribedReminders') || false
    this.setData({ isSubscribed })
  },

  checkFirstTime() {
    try {
      const guided = wx.getStorageSync('guideDone')
      if (guided) return

      const meds = wx.getStorageSync('medications')
      if (!meds || meds.length === 0) {
        this.setData({ showGuide: true })
      }
    } catch (e) { /* ignore */ }
  },

  dismissGuide() {
    this.setData({ showGuide: false })
    try { wx.setStorageSync('guideDone', true) } catch (e) { /* ignore */ }
  },

  loadTodayReminders() {
    try {
      const cloudReady = app.globalData && app.globalData.cloudReady
      const isOnline = app.globalData && app.globalData.isOnline
      
      if (cloudReady && isOnline && wx.cloud) {
        this.loadFromCloud()
      } else {
        this.loadFromLocal()
      }
    } catch (err) {
      console.log('加载提醒失败，使用本地数据:', err)
      this.loadFromLocal()
    }
  },

  async loadFromCloud() {
    try {
      const reminders = await dataService.getWithFallback('reminders', 'todayReminders', { enabled: true }, { orderBy: { field: 'time', direction: 'asc' } })
      const medications = await dataService.getWithFallback('medications', 'medications', {}, { orderBy: { field: 'createTime', direction: 'desc' } })

      const medMap = {}
      medications.forEach(med => {
        medMap[med._id] = med
      })

      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      const todayReminders = reminders.map(r => ({
        id: r._id,
        medicineName: r.medicationName || r.medicineName || '未知药品',
        medicationId: r.medicationId,
        dosage: medMap[r.medicationId] ? (medMap[r.medicationId].dosage || '') : '',
        instruction: medMap[r.medicationId] ? (medMap[r.medicationId].instruction || '') : '',
        time: r.time || '00:00',
        taken: false,
        isOverdue: false
      }))

      const records = wx.getStorageSync('todayRecords') || {}
      todayReminders.forEach(r => {
        if (records[r.id]) {
          r.taken = true
        } else if (r.time) {
          const [h, m] = r.time.split(':').map(Number)
          if (!isNaN(h) && !isNaN(m) && (h * 60 + m) < currentMinutes) {
            r.isOverdue = true
          }
        }
      })

      const pendingCount = todayReminders.filter(r => !r.taken).length

      this.setData({ todayReminders, pendingCount })
      this.updateTabBarBadge(pendingCount)
      wx.setStorageSync('todayReminders', todayReminders)

      this.checkLowStock(medications)
    } catch (err) {
      console.log('云端加载失败:', err)
      this.loadFromLocal()
    }
  },

  loadFromLocal() {
    try {
      const reminders = wx.getStorageSync('todayReminders') || []
      const pendingCount = reminders.filter(r => !r.taken).length
      this.setData({ todayReminders: reminders, pendingCount })
      this.updateTabBarBadge(pendingCount)
    } catch (e) {
      console.log('本地加载失败:', e)
      this.setData({ todayReminders: [], pendingCount: 0 })
      this.updateTabBarBadge(0)
    }

    this.checkLowStock(wx.getStorageSync('medications') || [])
  },

  checkLowStock(medications) {
    const lowStock = medications.filter(med => {
      const remaining = Number(med.remainingQuantity) || 0
      const warning = Number(med.lowStockWarning) || 3
      return remaining > 0 && remaining <= warning
    })
    this.setData({ lowStockMedications: lowStock })
  },

  loadStreak() {
    try {
      const cached = wx.getStorageSync('medicationStreak')
      if (cached) {
        const { streak, date } = cached
        if (date === this.getTodayKey()) {
          this.setData({ 'stats.streak': streak })
          return
        }
      }
    } catch (e) { /* ignore */ }

    if (wx.cloud && app.globalData && app.globalData.cloudReady && app.globalData.isOnline) {
      this.loadStreakFromCloud()
    }
  },

  loadStreakFromCloud() {
    const db = wx.cloud.database()
    const now = new Date()
    const pastYear = new Date(now.getTime() - 365 * 86400000)

    db.collection('records')
      .where({ createTime: db.command.gte(pastYear) })
      .orderBy('createTime', 'desc')
      .limit(100)
      .get()
      .then(res => {
        const streak = this.calcStreak(res.data || [])
        this.setData({ 'stats.streak': streak })
        try {
          wx.setStorageSync('medicationStreak', { streak, date: this.getTodayKey() })
        } catch (e) { /* ignore */ }
      })
      .catch(() => {
        const cached = wx.getStorageSync('medicationStreak')
        if (cached) this.setData({ 'stats.streak': cached.streak || 0 })
      })
  },

  calcStreak(records) {
    if (!records || records.length === 0) return 0
    const takenDays = new Set()
    records.forEach(r => {
      if (r.status === 'taken') {
        const d = new Date(r.createTime)
        takenDays.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
      }
    })
    const today = this.getTodayKey()
    const sorted = [...takenDays].sort().reverse()
    if (!sorted.includes(today)) {
      const yesterday = new Date(Date.now() - 86400000)
      const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
      if (!sorted.includes(yesterdayKey)) return 0
    }
    let count = 0
    for (const day of sorted) {
      const expected = new Date(Date.now() - count * 86400000)
      const expectedKey = `${expected.getFullYear()}-${String(expected.getMonth() + 1).padStart(2, '0')}-${String(expected.getDate()).padStart(2, '0')}`
      if (day === expectedKey) {
        count++
      } else {
        break
      }
    }
    return count
  },

  getTodayKey() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  },

  loadStats() {
    try {
      const todayReminders = this.data.todayReminders || []
      const takenCount = todayReminders.filter(r => r.taken).length
      const todayCount = todayReminders.length

      this.setData({
        stats: {
          todayCount,
          takenCount,
          hasReminders: todayCount > 0,
          compliance: todayCount > 0 ? Math.round((takenCount / todayCount) * 100) : 0
        }
      })
    } catch (e) {
      console.log('loadStats error:', e)
    }
  },

  markAsTaken(e) {
    try {
      const id = e.currentTarget.dataset.id
      if (!id) return

      const reminders = (this.data.todayReminders || []).map(item => {
        if (item.id === id) {
          return { ...item, taken: true }
        }
        return item
      })
      
      this.setData({ todayReminders: reminders })
      
      try {
        wx.setStorageSync('todayReminders', reminders)
      } catch (e) {
        console.log('保存失败:', e)
      }
      
      const records = {}
      try {
        Object.assign(records, wx.getStorageSync('todayRecords') || {})
      } catch (e) {}
      
      records[id] = {
        time: util.formatTime(new Date()),
        status: 'taken'
      }
      
      try {
        wx.setStorageSync('todayRecords', records)
      } catch (e) {
        console.log('保存记录失败:', e)
      }
      
      this.saveToCloud(id, reminders)
      this.loadStats()
      this.requestSubscribeIfNeeded()
      
      // 显示撤销提示
      wx.showToast({
        title: '已记录',
        icon: 'success',
        duration: 2000
      })

      // 保存原始状态用于撤销
      this._lastMarkedId = id
      this._lastReminders = this.data.todayReminders.map(r => ({...r}))
      this._lastRecords = {...records}
    } catch (err) {
      console.log('markAsTaken error:', err)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  undoMarkAsTaken() {
    if (!this._lastMarkedId) return

    const reminders = (this._lastReminders || []).map(item => {
      if (item.id === this._lastMarkedId) {
        return { ...item, taken: false }
      }
      return item
    })

    this.setData({ todayReminders: reminders })

    try {
      wx.setStorageSync('todayReminders', reminders)
    } catch (e) {}

    if (this._lastRecords) {
      delete this._lastRecords[this._lastMarkedId]
      try {
        wx.setStorageSync('todayRecords', this._lastRecords)
      } catch (e) {}
    }

    this.deleteCloudRecord(this._lastMarkedId)
    this.loadStats()
    this._lastMarkedId = null
    this._lastReminders = null
    this._lastRecords = null
  },

  deleteCloudRecord(reminderId) {
    if (!reminderId || !app.globalData || !app.globalData.cloudReady) return

    const db = wx.cloud.database()
    db.collection('records').where({ reminderId }).get().then(res => {
      if (res.data && res.data.length > 0) {
        app.pushToCloud({
          type: 'delete',
          collection: 'records',
          docId: res.data[0]._id
        }).catch(() => {})
      }
    }).catch(() => {})
  },

  saveToCloud(id, reminders) {
    try {
      const reminder = reminders.find(r => r.id === id)
      if (!reminder) return

      const recordData = {
        reminderId: id,
        medicineName: reminder.medicineName || '未知药品',
        status: 'taken',
        recordTime: new Date(),
        createTime: new Date()
      }

      app.pushToCloud({
        type: 'markTaken',
        collection: 'records',
        data: recordData
      }).catch(err => {
        console.log('云端保存失败:', err)
      })

      this.deductStock(reminder.medicationId)
    } catch (e) {
      console.log('saveToCloud error:', e)
    }
  },

  deductStock(medicationId) {
    if (!medicationId) return

    try {
      const medications = wx.getStorageSync('medications') || []
      const medIndex = medications.findIndex(m => m._id === medicationId || m.id === medicationId)
      if (medIndex < 0) return

      const med = medications[medIndex]
      const remaining = Number(med.remainingQuantity) || 0
      if (remaining <= 0) return

      const newRemaining = remaining - 1
      medications[medIndex] = { ...med, remainingQuantity: newRemaining }
      wx.setStorageSync('medications', medications)

      app.pushToCloud({
        type: 'update',
        collection: 'medications',
        docId: medicationId,
        data: { remainingQuantity: newRemaining, updateTime: new Date() }
      }).catch(err => {
        console.log('库存扣减云端同步失败:', err)
      })
    } catch (e) {
      console.log('deductStock error:', e)
    }
  },

  updateTabBarBadge(count) {
    try {
      if (count > 0) {
        wx.setTabBarBadge({ index: 0, text: String(Math.min(count, 99)) })
      } else {
        wx.removeTabBarBadge({ index: 0 })
      }
    } catch (e) { /* tab bar api 在部分页面不可用 */ }
  },

  requestSubscribeIfNeeded() {
    try {
      const lastRequest = wx.getStorageSync('lastSubscribeRequest')
      if (lastRequest) {
        const daysSince = (Date.now() - lastRequest) / 86400000
        if (daysSince < 3) return
      }

      if (wx.getStorageSync('subscribedReminders')) return

      const config = require('../../utils/config')
      wx.requestSubscribeMessage({
        tmplIds: [config.SUBSCRIBE_TEMPLATE_ID],
        success: (res) => {
          if (res[config.SUBSCRIBE_TEMPLATE_ID] === 'accept') {
            wx.setStorageSync('subscribedReminders', true)
          }
        },
        fail: () => {
          wx.setStorageSync('lastSubscribeRequest', Date.now() + 7 * 86400000)
          return
        },
        complete: () => {
          wx.setStorageSync('lastSubscribeRequest', Date.now())
        }
      })
    } catch (e) {
      console.log('requestSubscribeIfNeeded error:', e)
    }
  },

  goToAddMedication() {
    wx.navigateTo({
      url: '/pages/add-medication/add-medication',
      fail: () => {
        wx.showToast({ title: '页面跳转失败', icon: 'none' })
      }
    })
  },

  goToAddReminder() {
    wx.navigateTo({
      url: '/pages/add-reminder/add-reminder',
      fail: () => {
        wx.showToast({ title: '页面跳转失败', icon: 'none' })
      }
    })
  },

  goToMedication() {
    wx.switchTab({ url: '/pages/medication/medication' })
  },

  onPullDownRefresh() {
    this.loadData()
    setTimeout(() => {
      wx.stopPullDownRefresh()
      wx.showToast({ title: '刷新成功', icon: 'success' })
    }, 500)
  },

  onShareAppMessage() {
    return {
      title: '吃药提醒 - 守护健康',
      path: '/pages/index/index'
    }
  },

})