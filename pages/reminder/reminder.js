const dataService = require('../../services/data-service')

Page({
  data: {
    reminders: [],
    enabledCount: 0
  },

  onLoad() {
    this.loadReminders()
  },

  onShow() {
    this.loadReminders()
  },

  async loadReminders() {
    try {
      const data = await dataService.getWithFallback('reminders', 'reminders', {}, { orderBy: { field: 'createTime', direction: 'desc' }, limit: 100 })
      
      const enabledCount = data.filter(item => item.enabled).length
      
      this.setData({ 
        reminders: data,
        enabledCount 
      })
    } catch (err) {
      console.log('加载提醒失败:', err)
      const reminders = wx.getStorageSync('reminders') || []
      const enabledCount = reminders.filter(item => item.enabled).length
      
      this.setData({ 
        reminders,
        enabledCount 
      })
    }
  },

  async toggleReminder(e) {
    const id = e.currentTarget.dataset.id
    const enabled = e.detail.value
    
    try {
      const db = wx.cloud.database()
      await db.collection('reminders').doc(id).update({
        data: { enabled, updateTime: new Date() }
      })
      
      const reminders = this.data.reminders.map(item => {
        if (item._id === id) {
          return { ...item, enabled }
        }
        return item
      })
      
      const enabledCount = reminders.filter(item => item.enabled).length
      
      this.setData({ 
        reminders,
        enabledCount 
      })
      wx.setStorageSync('reminders', reminders)
      
      wx.showToast({
        title: enabled ? '已启用' : '已暂停',
        icon: 'success',
        duration: 1500
      })
    } catch (err) {
      console.log('云端更新失败，使用本地存储', err)
      // 降级到本地存储
      const reminders = this.data.reminders.map(item => {
        if (item._id === id) {
          return { ...item, enabled }
        }
        return item
      })
      
      const enabledCount = reminders.filter(item => item.enabled).length
      
      this.setData({ 
        reminders,
        enabledCount 
      })
      wx.setStorageSync('reminders', reminders)
      
      wx.showToast({
        title: enabled ? '已启用（本地）' : '已暂停（本地）',
        icon: 'none',
        duration: 1500
      })
    }
  },

  editReminder(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/add-reminder/add-reminder?id=${id}`
    })
  },

  deleteReminder(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.reminders.find(r => r._id === id)
    const medicineName = item ? (item.medicationName || item.medicineName) : '此提醒'
    
    wx.showModal({
      title: '⚠️ 删除确认',
      content: `确定要删除「${medicineName}」的提醒吗？\n删除后无法恢复`,
      confirmText: '删除',
      confirmColor: '#DC2626',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          await this.performDelete(id)
        }
      }
    })
  },

  async performDelete(id) {
    wx.showLoading({ title: '正在删除...' })
    
    try {
      const db = wx.cloud.database()
      await db.collection('reminders').doc(id).remove()
      
      const reminders = this.data.reminders.filter(item => item._id !== id)
      const enabledCount = reminders.filter(item => item.enabled).length
      
      this.setData({ 
        reminders,
        enabledCount 
      })
      wx.setStorageSync('reminders', reminders)
      
      wx.hideLoading()
      
      wx.showToast({
        title: '✅ 删除成功',
        icon: 'success',
        duration: 1500
      })
    } catch (err) {
      wx.hideLoading()
      console.error('删除失败:', err)
      
      wx.showModal({
        title: '删除失败',
        content: '网络异常或权限不足，请稍后重试',
        showCancel: false,
        confirmText: '我知道了'
      })
    }
  },

  addReminder() {
    wx.navigateTo({
      url: '/pages/add-reminder/add-reminder'
    })
  },

  requestSubscription() {
    const config = require('../../utils/config')
    wx.requestSubscribeMessage({
      tmplIds: [config.SUBSCRIBE_TEMPLATE_ID],
      success: (res) => {
        if (res[config.SUBSCRIBE_TEMPLATE_ID] === 'accept') {
          wx.setStorageSync('subscribedReminders', true)
          wx.showToast({ title: '通知已开启', icon: 'success' })
        }
      },
      fail: () => {
        wx.showToast({ title: '用户拒绝授权', icon: 'none' })
      }
    })
  }
})
