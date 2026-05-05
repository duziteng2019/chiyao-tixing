const ACHIEVEMENTS = [
  { days: 7, title: '初露锋芒', desc: '连续服药 7 天', icon: '🥉', color: '#CD7F32' },
  { days: 30, title: '坚持不懈', desc: '连续服药 30 天', icon: '🥈', color: '#C0C0C0' },
  { days: 100, title: '百日坚守', desc: '连续服药 100 天', icon: '🥇', color: '#FFD700' },
  { days: 365, title: '健康达人', desc: '连续服药 365 天', icon: '🏆', color: '#E040FB' }
]

const app = getApp()

Page({
  data: {
    userInfo: {},
    isEditing: false,
    editAvatar: '',
    editNickname: '',
    syncStatusText: '点击同步',
    syncOnline: true,
    isSyncing: false,
    stats: { todayCount: 0, takenCount: 0, compliance: 0 },
    streak: 0,
    achievements: ACHIEVEMENTS.map(a => ({ ...a, unlocked: false }))
  },

  onLoad() {
    this.loadProfile()
    this.loadUserStats()
    this.loadAchievements()
  },

  onShow() {
    this.loadProfile()
    this.loadUserStats()
    this.loadAchievements()
  },

  loadProfile() {
    try {
      const syncInfo = app.getSyncStatus ? app.getSyncStatus() : { isOnline: true }
      const userInfo = (app.globalData && app.globalData.userInfo) || {}
      this.setData({
        userInfo,
        syncOnline: syncInfo.isOnline !== false,
        syncStatusText: this.formatSyncStatus(syncInfo)
      })
    } catch (e) {
      console.error('[Profile] loadProfile error:', e)
    }
  },

  formatSyncStatus(syncInfo) {
    if (!syncInfo || !syncInfo.isOnline) return '当前离线'
    return '点击同步'
  },

  loadUserStats() {
    try {
      let todayReminders = []
      let takenCount = 0
      try {
        todayReminders = wx.getStorageSync('todayReminders') || []
      } catch (e) { /* ignore */ }
      try {
        const records = wx.getStorageSync('todayRecords') || {}
        todayReminders.forEach(r => {
          if (records[r.id]) takenCount++
        })
      } catch (e) { /* ignore */ }
      this.setData({
        stats: {
          todayCount: todayReminders.length,
          takenCount,
          compliance: todayReminders.length > 0 ? Math.round((takenCount / todayReminders.length) * 100) : 0
        }
      })
    } catch (e) {
      console.error('[Profile] loadUserStats error:', e)
    }
  },

  loadAchievements() {
    try {
      const cached = wx.getStorageSync('medicationStreak')
      const streak = cached ? (cached.streak || 0) : 0
      const achievements = ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: streak >= a.days
      }))
      this.setData({ streak, achievements })
    } catch (e) {
      console.log('[Profile] loadAchievements error:', e)
    }
  },

  toggleEdit() {
    const editing = !this.data.isEditing
    if (editing) {
      const info = this.data.userInfo
      this.setData({
        isEditing: true,
        editAvatar: info.avatarUrl || '',
        editNickname: info.nickName || ''
      })
    } else {
      this.setData({ isEditing: false })
    }
  },

  onChooseAvatar(e) {
    if (!e || !e.detail || !e.detail.avatarUrl) return
    this.setData({ editAvatar: e.detail.avatarUrl })
  },

  onInputNickname(e) {
    this.setData({ editNickname: e.detail.value })
  },

  async saveProfile() {
    const nickName = this.data.editNickname.trim() || '用户'
    let avatarUrl = this.data.editAvatar

    try {
      if (avatarUrl && avatarUrl.startsWith('wxfile://') && app.globalData && app.globalData.isOnline) {
        avatarUrl = await this.uploadAvatar(avatarUrl)
      }
    } catch (e) {
      console.error('[Profile] saveProfile upload error:', e)
    }

    const userInfo = { nickName, avatarUrl }
    if (app.setUserInfo) {
      app.setUserInfo(userInfo)
    } else {
      app.globalData = app.globalData || {}
      app.globalData.userInfo = userInfo
    }

    this.setData({
      userInfo,
      isEditing: false
    })
    wx.showToast({ title: '已保存', icon: 'success' })
  },

  uploadAvatar(tempFilePath) {
    return new Promise((resolve) => {
      if (!app.globalData || !app.globalData.isOnline) {
        resolve(tempFilePath)
        return
      }
      wx.showLoading({ title: '上传头像...', mask: true })
      wx.cloud.uploadFile({
        cloudPath: `avatars/${app.globalData.openid || Date.now()}.jpg`,
        filePath: tempFilePath,
        success: res => {
          resolve(res.fileID || tempFilePath)
        },
        fail: () => {
          resolve(tempFilePath)
        },
        complete: () => {
          wx.hideLoading()
        }
      })
    })
  },

  triggerSync() {
    if (this.data.isSyncing) return
    if (!this.data.syncOnline) {
      wx.showToast({ title: '网络不可用', icon: 'none' })
      return
    }
    this.setData({ isSyncing: true, syncStatusText: '同步中...' })
    wx.showLoading({ title: '同步中...', mask: true })
    if (app.syncData) {
      app.syncData().then(() => {
        this.setData({
          syncStatusText: '同步完成',
          syncOnline: true,
          isSyncing: false
        })
        wx.hideLoading()
        wx.showToast({ title: '同步成功', icon: 'success' })
        this.loadUserStats()
      }).catch(() => {
        this.setData({ isSyncing: false, syncStatusText: '同步失败' })
        wx.hideLoading()
      })
    } else {
      this.setData({ isSyncing: false, syncStatusText: '同步失败' })
      wx.hideLoading()
    }
  },

  goToReminders() {
    wx.navigateTo({ url: '/pages/reminder/reminder' })
  },

  goToHelp() {
    wx.navigateTo({ url: '/pages/help/help' })
  },

  goToAbout() {
    wx.navigateTo({ url: '/pages/about/about' })
  }
})
