const app = getApp()

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
      const db = wx.cloud.database()
      const { data } = await db.collection('medications').orderBy('createTime', 'desc').limit(100).get()
      
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
      
      wx.setStorageSync('medications', data)
    } catch (err) {
      console.log('从云端加载药品失败，使用本地数据', err)
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

  deleteMedication(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '⚠️ 删除确认',
      content: '确定要删除这个药品吗？\n删除后无法恢复',
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
      await db.collection('medications').doc(id).remove()
      
      // 更新列表（带动画效果）
      const medications = this.data.medications.filter(item => item._id !== id)
      const stockLowCount = medications.filter(med => med.lowStock).length
      
      this.setData({ 
        medications,
        stockLowCount 
      })
      
      wx.setStorageSync('medications', medications)
      
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
