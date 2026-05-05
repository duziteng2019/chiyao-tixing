const config = require('../../utils/config')

Page({
  data: {
    isEdit: false,
    editId: null,
    form: {
      medicationId: '',
      medicationName: '',
      medicationIndex: null,
      time: '',
      repeatType: '',
      repeatLabel: '',
      repeatIndex: null,
      enabled: true
    },
    medications: [],
    repeatOptions: [
      { label: '每天', value: 'daily' },
      { label: '工作日（周一至周五）', value: 'weekdays' },
      { label: '周末', value: 'weekend' },
      { label: '自定义', value: 'custom' }
    ]
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        isEdit: true,
        editId: options.id
      })
      this.loadReminder(options.id)
    }
    this.loadMedications()
  },

  async loadReminder(id) {
    wx.showLoading({ title: '加载中...' })
    try {
      const db = wx.cloud.database()
      const { data } = await db.collection('reminders').doc(id).get()
      
      const repeatIndex = this.data.repeatOptions.findIndex(
        option => option.value === data.repeatType
      )
      
      this.setData({
        form: {
          medicationId: data.medicationId,
          medicationName: data.medicationName,
          medicationIndex: null,
          time: data.time,
          repeatType: data.repeatType,
          repeatLabel: data.repeatLabel,
          repeatIndex: repeatIndex >= 0 ? repeatIndex : null,
          enabled: data.enabled
        }
      })
      wx.hideLoading()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  async loadMedications() {
    try {
      const db = wx.cloud.database()
      const { data } = await db.collection('medications').limit(100).get()
      this.setData({ medications: data })
      
      if (this.data.form.medicationId && data.length > 0) {
        const medicationIndex = data.findIndex(
          med => med._id === this.data.form.medicationId
        )
        if (medicationIndex >= 0) {
          this.setData({
            'form.medicationIndex': medicationIndex
          })
        }
      }
    } catch (err) {
      const medications = wx.getStorageSync('medications') || []
      this.setData({ medications })
    }
  },

  onMedicationChange(e) {
    const index = e.detail.value
    const medication = this.data.medications[index]
    this.setData({
      'form.medicationIndex': index,
      'form.medicationId': medication._id,
      'form.medicationName': medication.name
    })
  },

  onTimeChange(e) {
    this.setData({
      'form.time': e.detail.value
    })
  },

  onRepeatChange(e) {
    const index = e.detail.value
    const option = this.data.repeatOptions[index]
    this.setData({
      'form.repeatIndex': index,
      'form.repeatType': option.value,
      'form.repeatLabel': option.label
    })
  },

  onEnabledChange(e) {
    this.setData({
      'form.enabled': e.detail.value
    })
  },

  handleCancel() {
    wx.navigateBack()
  },

  async handleSave() {
    const form = this.data.form

    if (!form.medicationId) {
      wx.showToast({ title: '请选择药品', icon: 'none' })
      return
    }

    if (!form.time) {
      wx.showToast({ title: '请选择提醒时间', icon: 'none' })
      return
    }

    if (!form.repeatType) {
      wx.showToast({ title: '请选择重复模式', icon: 'none' })
      return
    }

    wx.showLoading({ title: '保存中...' })

    try {
      const db = wx.cloud.database()
      const reminderData = {
        medicationId: form.medicationId,
        medicationName: form.medicationName,
        time: form.time,
        repeatType: form.repeatType,
        repeatLabel: form.repeatLabel,
        enabled: form.enabled,
        updateTime: new Date()
      }

      if (this.data.isEdit) {
        await db.collection('reminders').doc(this.data.editId).update({
          data: reminderData
        })
      } else {
        reminderData.createTime = new Date()
        await db.collection('reminders').add({
          data: reminderData
        })
      }

      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })

      // 稍等让用户看到成功提示，再弹出订阅窗口
      await new Promise(r => setTimeout(r, 500))
      await this.requestSubscribe()

      wx.navigateBack()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  async requestSubscribe() {
    try {
      const tmplId = config.SUBSCRIBE_TEMPLATE_ID

      const res = await wx.requestSubscribeMessage({
        tmplIds: [tmplId]
      })

      if (res[tmplId] === 'accept' || res[tmplId] === 'TM') {
        wx.setStorageSync('subscribedReminders', true)
      }
    } catch (err) {
      console.log('订阅消息请求失败', err)
    }
  }
})
