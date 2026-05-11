const app = getApp()
const dataService = require('../../services/data-service')

Page({
  data: {
    medications: [],
    stockLowCount: 0
  },

  onLoad() {
    this.loadMedications()
  },

  onShow() {
    this.loadMedications()
  },

  async loadMedications() {
    try {
      const data = await dataService.getWithFallback('medications', 'medications', {}, { orderBy: { field: 'createTime', direction: 'desc' }, limit: 100 })
      
      // 为每个药品添加lowStock属性，便于UI展示
      const medicationsWithStatus = data.map(item => ({
        ...item,
        lowStock: this.checkStockLow(item)
      }))
      
      // 计算低库存药品数量
      const stockLowCount = medicationsWithStatus.filter(med => med.lowStock).length
      
      this.setData({ 
        medications: medicationsWithStatus,
        stockLowCount 
      })
    } catch (err) {
      console.log('加载药品失败:', err)
      const medications = wx.getStorageSync('medications') || []
      
      // 同样处理本地数据
      const medicationsWithStatus = medications.map(item => ({
        ...item,
        lowStock: this.checkStockLow(item)
      }))
      const stockLowCount = medicationsWithStatus.filter(med => med.lowStock).length
      
      this.setData({ 
        medications: medicationsWithStatus,
        stockLowCount 
      })
    }
  },

  checkStockLow(item) {
    const remaining = Number(item.remainingQuantity) || 0
    const warning = Number(item.lowStockWarning) || 3
    return remaining <= warning && remaining > 0
  },

  stockLow(item) {
    return item.lowStock || false
  },

  editMedication(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/add-medication/add-medication?id=${id}`
    })
  },

  async deleteMedication(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.medications.find(m => m._id === id)
    const medName = item ? item.name : '此药品'

    wx.showLoading({ title: '查询关联提醒...' })
    try {
      const db = wx.cloud.database()
      const { data: relatedReminders } = await db.collection('reminders')
        .where({ medicationId: id })
        .get()

      wx.hideLoading()

      let content = `确定要删除「${medName}」吗？\n删除后无法恢复`
      if (relatedReminders.length > 0) {
        content += `\n同时删除 ${relatedReminders.length} 个关联提醒`
      }

      wx.showModal({
        title: '⚠️ 删除确认',
        content,
        confirmText: '删除',
        confirmColor: '#DC2626',
        cancelText: '取消',
        success: async (res) => {
          if (res.confirm) {
            await this.performDelete(id, relatedReminders)
          }
        }
      })
    } catch (err) {
      wx.hideLoading()
      wx.showModal({
        title: '⚠️ 删除确认',
        content: `确定要删除「${medName}」吗？\n删除后无法恢复`,
        confirmText: '删除',
        confirmColor: '#DC2626',
        cancelText: '取消',
        success: async (res) => {
          if (res.confirm) {
            await this.performDelete(id, [])
          }
        }
      })
    }
  },

  async performDelete(id, relatedReminders = []) {
    wx.showLoading({ title: '正在删除...' })

    try {
      const db = wx.cloud.database()
      await db.collection('medications').doc(id).remove()

      for (const reminder of relatedReminders) {
        await db.collection('reminders').doc(reminder._id).remove().catch(() => {})
      }

      const medications = this.data.medications.filter(item => item._id !== id)
      const stockLowCount = medications.filter(med => med.lowStock).length

      this.setData({ medications, stockLowCount })
      wx.setStorageSync('medications', medications)

      const localReminders = (wx.getStorageSync('reminders') || []).filter(
        r => r.medicationId !== id
      )
      wx.setStorageSync('reminders', localReminders)

      wx.hideLoading()
      wx.showToast({ title: '✅ 删除成功', icon: 'success', duration: 1500 })
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

  addMedication() {
    wx.navigateTo({
      url: '/pages/add-medication/add-medication'
    })
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.loadMedications().then(() => {
      wx.stopPullDownRefresh()
      wx.showToast({
        title: '已刷新',
        icon: 'success',
        duration: 1000
      })
    }).catch(() => {
      wx.stopPullDownRefresh()
    })
  }
})
