const app = getApp()
const util = require('../../utils/util.js')

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

  loadFromCloud() {
    if (!wx.cloud) {
      this.loadFromLocal()
      return
    }

    const db = wx.cloud.database()
    
    Promise.all([
      db.collection('reminders').where({ enabled: true }).get(),
      db.collection('medications').get()
    ])
      .then(([remindersRes, medRes]) => {
        const reminders = remindersRes.data || []
        const medications = medRes.data || []
        const medMap = {}
        medications.forEach(med => {
          medMap[med._id] = med
        })

        const todayReminders = reminders.map(r => ({
          id: r._id,
          medicineName: r.medicationName || r.medicineName || '未知药品',
          dosage: medMap[r.medicationId] ? (medMap[r.medicationId].dosage || '') : '',
          time: r.time || '00:00',
          taken: false
        })).sort((a, b) => a.time.localeCompare(b.time))

        const records = wx.getStorageSync('todayRecords') || {}
        todayReminders.forEach(r => {
          if (records[r.id]) {
            r.taken = true
          }
        })

        this.setData({ todayReminders })
        wx.setStorageSync('todayReminders', todayReminders)

        this.checkLowStock(medications)
      })
      .catch(err => {
        console.log('云端加载失败:', err)
        this.loadFromLocal()
      })
  },

  loadFromLocal() {
    try {
      const reminders = wx.getStorageSync('todayReminders') || []
      this.setData({ todayReminders: reminders })
    } catch (e) {
      console.log('本地加载失败:', e)
      this.setData({ todayReminders: [] })
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
    if (sorted.length === 0 || !sorted.includes(today)) {
      if (!sorted.includes(today)) {
        const yesterday = new Date(Date.now() - 86400000)
        const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
        if (!sorted.includes(yesterdayKey)) return 0
      }
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
      
      wx.showToast({
        title: '已记录',
        icon: 'success'
      })
    } catch (err) {
      console.log('markAsTaken error:', err)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  saveToCloud(id, reminders) {
    try {
      if (!wx.cloud || !app.globalData || !app.globalData.cloudReady || !app.globalData.isOnline) {
        return
      }

      const db = wx.cloud.database()
      const reminder = reminders.find(r => r.id === id)
      
      if (!reminder) return

      db.collection('records').add({
        data: {
          reminderId: id,
          medicineName: reminder.medicineName,
          status: 'taken',
          recordTime: new Date(),
          createTime: new Date()
        }
      }).catch(err => {
        console.log('云端保存失败:', err)
      })
    } catch (e) {
      console.log('saveToCloud error:', e)
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
  }
})