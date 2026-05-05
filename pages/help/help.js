Page({
  data: {
    helpItems: [
      {
        title: '如何添加药品',
        content: '1. 点击底部"药品"标签页\n2. 点击右上角"+"按钮\n3. 填写药品名称、剂量、服用频率等信息\n4. 可选填开始/结束日期、库存数量等\n5. 点击"保存"完成添加',
        iconChar: '💊'
      },
      {
        title: '如何设置提醒',
        content: '1. 在"药品"页面点击某个药品\n2. 或直接进入提醒设置页面\n3. 选择要设置提醒的药品\n4. 设置提醒时间（支持多个时间点）\n5. 选择重复频率（每天/每周等）\n6. 开启提醒开关',
        iconChar: '🔔'
      },
      {
        title: '如何记录服药',
        content: '方式一：首页快速记录\n- 在首页看到今日提醒列表\n- 点击对应药品的"已服"按钮\n\n方式二：记录页面查看\n- 点击底部"记录"标签页\n- 查看历史服药记录\n- 可补录漏服记录',
        iconChar: '✅'
      },
      {
        title: '查看统计数据',
        content: '1. 进入"记录"页面\n2. 查看本周/本月依从性统计\n3. 查看连续服药天数\n4. 切换周视图/月视图查看趋势图\n5. 图表显示每日服药次数',
        iconChar: '📊'
      },
      {
        title: '数据同步说明',
        content: '- 应用会自动保存数据到云端\n- 网络恢复时自动同步\n- 也可在"我的"页面手动点击同步\n- 离线状态下数据保存在本地\n- 重新联网后会自动上传',
        iconChar: '🔄'
      },
      {
        title: '订阅消息说明',
        content: '为确保能收到服药提醒：\n1. 设置提醒时会请求订阅权限\n2. 需要点击"允许"接收消息\n3. 每次订阅可接收多条提醒\n4. 如未收到请检查是否开启通知\n5. 可在设置中重新订阅',
        iconChar: '✉️'
      }
    ],
    expandedIndex: null
  },

  toggleItem(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      expandedIndex: this.data.expandedIndex === index ? null : index
    })
  },

  contactSupport() {
    wx.showModal({
      title: '联系客服',
      content: '如有问题，请通过以下方式联系我们：\n邮箱：support@medication.com\n微信：medication_helper',
      showCancel: false,
      confirmText: '我知道了'
    })
  }
})
