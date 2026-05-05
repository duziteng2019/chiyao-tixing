Page({
  data: {
    reminders: []
  },

  onLoad() {
    this.loadReminders()
  },

  onShow() {
    this.loadReminders()
  },

  async loadReminders() {
    try {
      const db = wx.cloud.database()
      const { data } = await db.collection('reminders').orderBy('createTime', 'desc').limit(100).get()
      this.setData({ reminders: data })
      wx.setStorageSync('reminders', data)
    } catch (err) {
      console.log('从云端加载提醒失败，使用本地数据', err)
      const reminders = wx.getStorageSync('reminders') || []
      this.setData({ reminders })
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
      this.setData({ reminders })
      wx.setStorageSync('reminders', reminders)
    } catch (err) {
      wx.showToast({
        title: '更新失败',
        icon: 'none'
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
    wx.showModal({
      title: '提示',
      content: '确定要删除这个提醒吗？',
      success: async (res) => {
        if (res.confirm) {
          await this.performDelete(id)
        }
      }
    })
  },

  async performDelete(id) {
    wx.showLoading({ title: '删除中...' })
    try {
      const db = wx.cloud.database()
      await db.collection('reminders').doc(id).remove()
      
      const reminders = this.data.reminders.filter(item => item._id !== id)
      this.setData({ reminders })
      wx.setStorageSync('reminders', reminders)
      
      wx.hideLoading()
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
  },

  addReminder() {
    wx.navigateTo({
      url: '/pages/add-reminder/add-reminder'
    })
  }
})
