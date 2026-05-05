Page({
  data: {
    appInfo: {
      name: '吃药提醒',
      version: '1.0.0',
      slogan: '让健康更简单',
      description: '一款专注于帮助用户管理药品信息、设置服药提醒、追踪服药记录的智能健康管理小程序。'
    },
    features: [
      { iconChar: '💊', title: '药品管理', desc: '轻松管理所有药品信息' },
      { iconChar: '🔔', title: '智能提醒', desc: '准时提醒，不再漏服' },
      { iconChar: '📊', title: '记录统计', desc: '可视化服药数据' },
      { iconChar: '🔄', title: '云端同步', desc: '数据安全不丢失' }
    ],
    teamInfo: {
      name: '健康科技团队',
      mission: '用技术改善人们的生活质量',
      email: 'support@medication.com'
    }
  },

  copyEmail() {
    wx.setClipboardData({
      data: this.data.teamInfo.email,
      success: () => {
        wx.showToast({ title: '邮箱已复制', icon: 'success' })
      }
    })
  },

  viewPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们重视您的隐私保护：\n\n1. 仅收集必要的用户信息\n2. 数据加密存储在云端\n3. 不会向第三方分享您的数据\n4. 您可以随时删除自己的数据\n5. 遵守相关法律法规要求',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  viewTerms() {
    wx.showModal({
      title: '使用条款',
      content: '使用本应用即表示您同意：\n\n1. 本应用仅供个人健康管理使用\n2. 药品信息仅供参考，不构成医疗建议\n3. 请遵医嘱服用药品\n4. 我们不对因使用本应用造成的后果负责\n5. 保留对服务条款的最终解释权',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  checkUpdate() {
    wx.showModal({
      title: '检查更新',
      content: '当前已是最新版本\n版本号：1.0.0',
      showCancel: false,
      confirmText: '我知道了'
    })
  }
})
