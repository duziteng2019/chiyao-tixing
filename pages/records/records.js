Page({
  data: {
    stats: { weeklyRate: 0, monthlyRate: 0, streak: 0 },
    recentRecords: [],
    chartMode: 'week',
    monthlyChartData: null,
    showCatchUp: false,
    showReport: false,
    reportData: null,
    catchUpForm: {
      medicationIndex: null,
      medicationId: '',
      medicationName: '',
      date: '',
      time: ''
    },
    catchUpMedications: []
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    try {
      const db = wx.cloud.database()
      const _ = db.command

      const { data: allRecords } = await db.collection('records')
        .orderBy('createTime', 'desc')
        .limit(100)
        .get()

      // 加载提醒列表，用于纠正旧记录中遗漏的药品名称
      const { data: reminders } = await db.collection('reminders').limit(100).get()
      const reminderMap = {}
      reminders.forEach(r => {
        reminderMap[r._id] = r.medicationName || r.medicineName || ''
      })
      allRecords.forEach(r => {
        if (!r.medicineName || r.medicineName === '未知药品') {
          r.medicineName = reminderMap[r.reminderId] || '未知药品'
        }
      })

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      const weekAgo = new Date(today.getTime() - 6 * 86400000)
      const monthAgo = new Date(today.getTime() - 29 * 86400000)

      const weekRecords = allRecords.filter(r => new Date(r.createTime) >= weekAgo)
      const monthRecords = allRecords.filter(r => new Date(r.createTime) >= monthAgo)

      const dailyMap = {}
      for (let i = 0; i < 7; i++) {
        const d = new Date(today.getTime() - (6 - i) * 86400000)
        const key = formatDayKey(d)
        dailyMap[key] = { date: d, total: 0, taken: 0 }
      }

      const takenMonthMap = {}

      weekRecords.forEach(r => {
        const key = formatDayKey(new Date(r.createTime))
        if (dailyMap[key]) {
          dailyMap[key].total++
          if (r.status === 'taken') {
            dailyMap[key].taken++
          }
        }
      })

      const weekTaken = weekRecords.filter(r => r.status === 'taken').length
      const monthTaken = monthRecords.filter(r => r.status === 'taken').length

      monthRecords.forEach(r => {
        const key = formatDayKey(new Date(r.createTime))
        if (!takenMonthMap[key]) takenMonthMap[key] = { taken: 0, total: 0 }
        takenMonthMap[key].total++
        if (r.status === 'taken') takenMonthMap[key].taken++
      })

      let streak = 0
      for (let i = 0; i < 365; i++) {
        const d = new Date(today.getTime() - i * 86400000)
        const key = formatDayKey(d)
        const dayData = takenMonthMap[key]
        if (dayData && dayData.taken > 0) {
          streak++
        } else {
          break
        }
      }

      const weeklyRate = weekRecords.length > 0
        ? Math.round((weekTaken / weekRecords.length) * 100) : 0
      const monthlyRate = monthRecords.length > 0
        ? Math.round((monthTaken / monthRecords.length) * 100) : 0

      this.setData({
        stats: { weeklyRate, monthlyRate, streak },
        recentRecords: allRecords.slice(0, 20).map(r => ({
          id: r._id,
          medicineName: r.medicineName,
          date: formatDate(r.createTime),
          time: formatTime(r.createTime),
          status: r.status
        })),
        dailyChartData: dailyMap
      })

      this.drawChart(dailyMap)
    } catch (err) {
      console.log('加载记录失败', err)
      const records = wx.getStorageSync('medicationRecords') || []
      this.setData({ recentRecords: records })
    }
  },

  drawChart(dailyMap) {
    const query = wx.createSelectorQuery()
    query.select('#chart').fields({ node: true, size: true }).exec((res) => {
      if (!res || !res[0]) return
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const windowInfo = wx.getWindowInfo()
      const dpr = windowInfo.pixelRatio
      const width = res[0].width
      const height = res[0].height

      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      const pad = { top: 20, right: 20, bottom: 40, left: 50 }
      const chartW = width - pad.left - pad.right
      const chartH = height - pad.top - pad.bottom

      ctx.clearRect(0, 0, width, height)

      const values = Object.values(dailyMap).map(d => d.taken)
      const maxVal = Math.max(...values, 1)

      // grid lines
      ctx.strokeStyle = '#f0f0f0'
      ctx.lineWidth = 1
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + (chartH / 4) * i
        ctx.beginPath()
        ctx.moveTo(pad.left, y)
        ctx.lineTo(width - pad.right, y)
        ctx.stroke()

        ctx.fillStyle = '#999'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), pad.left - 8, y + 4)
      }

      // bars
      const barW = Math.min(chartW / values.length * 0.6, 40)
      const gap = chartW / values.length

      const dayNames = ['一', '二', '三', '四', '五', '六', '日']

      values.forEach((v, i) => {
        const x = pad.left + gap * i + (gap - barW) / 2
        const barH = (v / maxVal) * chartH
        const y = pad.top + chartH - barH

        // bar gradient
        const gradient = ctx.createLinearGradient(x, y, x, pad.top + chartH)
        gradient.addColorStop(0, '#4CAF50')
        gradient.addColorStop(1, '#81C784')
        ctx.fillStyle = gradient

        // rounded bar
        const r = Math.min(barW / 3, 6)
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + barW - r, y)
        ctx.arcTo(x + barW, y, x + barW, y + r, r)
        ctx.lineTo(x + barW, pad.top + chartH)
        ctx.lineTo(x, pad.top + chartH)
        ctx.lineTo(x, y + r)
        ctx.arcTo(x, y, x + r, y, r)
        ctx.fill()

        // day label
        ctx.fillStyle = '#666'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        const dateKey = Object.keys(dailyMap)[i]
        ctx.fillText(dayNames[new Date(dateKey).getDay() === 0 ? 6 : new Date(dateKey).getDay() - 1], x + barW / 2, height - pad.bottom + 20)

        // value on top
        if (v > 0) {
          ctx.fillStyle = '#4CAF50'
          ctx.font = 'bold 12px sans-serif'
          ctx.fillText(v, x + barW / 2, y - 6)
        }
      })
    })
  },

  switchToWeek() {
    if (this.data.chartMode === 'week') return
    this.setData({ chartMode: 'week' })
    this.drawChart(this.data.dailyChartData)
  },

  async switchToMonth() {
    if (this.data.chartMode === 'month') return
    this.setData({ chartMode: 'month' })
    wx.showLoading({ title: '加载中...' })

    try {
      const db = wx.cloud.database()
      const { data: allRecords } = await db.collection('records')
        .orderBy('createTime', 'desc')
        .limit(100)
        .get()

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

      const monthlyMap = {}
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(today.getFullYear(), today.getMonth(), i)
        const key = formatDayKey(d)
        monthlyMap[key] = { date: d, total: 0, taken: 0 }
      }

      const monthRecords = allRecords.filter(r => {
        const recordDate = new Date(r.createTime)
        return recordDate >= monthStart && recordDate < new Date(today.getFullYear(), today.getMonth() + 1, 1)
      })

      monthRecords.forEach(r => {
        const key = formatDayKey(new Date(r.createTime))
        if (monthlyMap[key]) {
          monthlyMap[key].total++
          if (r.status === 'taken') {
            monthlyMap[key].taken++
          }
        }
      })

      this.setData({ monthlyChartData: monthlyMap })
      this.drawMonthlyChart(monthlyMap)
      wx.hideLoading()
    } catch (err) {
      console.log('加载月度数据失败', err)
      wx.hideLoading()
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  drawMonthlyChart(monthlyMap) {
    const query = wx.createSelectorQuery()
    query.select('#chart').fields({ node: true, size: true }).exec((res) => {
      if (!res || !res[0]) return
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const windowInfo = wx.getWindowInfo()
      const dpr = windowInfo.pixelRatio
      const width = res[0].width
      const height = res[0].height

      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      const pad = { top: 20, right: 20, bottom: 40, left: 50 }
      const chartW = width - pad.left - pad.right
      const chartH = height - pad.top - pad.bottom

      ctx.clearRect(0, 0, width, height)

      const values = Object.values(monthlyMap).map(d => d.taken)
      const maxVal = Math.max(...values, 1)

      ctx.strokeStyle = '#f0f0f0'
      ctx.lineWidth = 1
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + (chartH / 4) * i
        ctx.beginPath()
        ctx.moveTo(pad.left, y)
        ctx.lineTo(width - pad.right, y)
        ctx.stroke()

        ctx.fillStyle = '#999'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), pad.left - 8, y + 4)
      }

      const barW = Math.min(chartW / values.length * 0.7, 20)
      const gap = chartW / values.length

      values.forEach((v, i) => {
        const x = pad.left + gap * i + (gap - barW) / 2
        const barH = (v / maxVal) * chartH
        const y = pad.top + chartH - barH

        const gradient = ctx.createLinearGradient(x, y, x, pad.top + chartH)
        gradient.addColorStop(0, '#4CAF50')
        gradient.addColorStop(1, '#81C784')
        ctx.fillStyle = gradient

        const r = Math.min(barW / 3, 4)
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + barW - r, y)
        ctx.arcTo(x + barW, y, x + barW, y + r, r)
        ctx.lineTo(x + barW, pad.top + chartH)
        ctx.lineTo(x, pad.top + chartH)
        ctx.lineTo(x, y + r)
        ctx.arcTo(x, y, x + r, y, r)
        ctx.fill()

        const dateKey = Object.keys(monthlyMap)[i]
        const dayNum = new Date(dateKey).getDate()
        const isToday = formatDayKey(new Date()) === dateKey

        ctx.fillStyle = isToday ? '#4CAF50' : '#666'
        ctx.font = `${isToday ? 'bold ' : ''}10px sans-serif`
        ctx.textAlign = 'center'

        if (i % 5 === 0 || isToday) {
          ctx.fillText(dayNum, x + barW / 2, height - pad.bottom + 18)
        }

        if (v > 0 && (i % 3 === 0 || v >= maxVal)) {
          ctx.fillStyle = '#4CAF50'
          ctx.font = 'bold 10px sans-serif'
          ctx.fillText(v, x + barW / 2, y - 4)
        }
      })
    })
  },

  // === 周报功能 ===
  toggleReport() {
    this.setData({ showReport: !this.data.showReport })
    if (!this.data.showReport) return

    this.generateReport()
  },

  async generateReport() {
    wx.showLoading({ title: '生成周报...' })
    try {
      const db = wx.cloud.database()
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 6 * 86400000)
      const monthAgo = new Date(now.getTime() - 29 * 86400000)

      const { data: allRecords } = await db.collection('records')
        .orderBy('createTime', 'desc')
        .limit(100)
        .get()

      const { data: reminders } = await db.collection('reminders').limit(100).get()
      const reminderMap = {}
      reminders.forEach(r => { reminderMap[r._id] = r.medicationName || '' })
      allRecords.forEach(r => {
        if (!r.medicineName || r.medicineName === '未知药品') {
          r.medicineName = reminderMap[r.reminderId] || '未知'
        }
      })

      const weekRecords = allRecords.filter(r => new Date(r.createTime) >= weekAgo)
      const monthRecords = allRecords.filter(r => new Date(r.createTime) >= monthAgo)

      const weekTaken = weekRecords.filter(r => r.status === 'taken').length
      const weekTotal = weekRecords.length
      const weekRate = weekTotal > 0 ? Math.round((weekTaken / weekTotal) * 100) : 0

      const monthTaken = monthRecords.filter(r => r.status === 'taken').length
      const monthTotal = monthRecords.length
      const monthRate = monthTotal > 0 ? Math.round((monthTaken / monthTotal) * 100) : 0

      const medStats = {}
      allRecords.forEach(r => {
        if (r.status === 'taken') {
          const name = r.medicineName || '未知'
          medStats[name] = (medStats[name] || 0) + 1
        }
      })
      const topMed = Object.entries(medStats).sort((a, b) => b[1] - a[1])[0]

      const dayLabels = ['一', '二', '三', '四', '五', '六', '日']
      const weekChart = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000)
        const key = formatDayKey(d)
        const dayRecords = weekRecords.filter(r => formatDayKey(new Date(r.createTime)) === key)
        weekChart.push({
          label: dayLabels[6 - i],
          taken: dayRecords.filter(r => r.status === 'taken').length,
          total: dayRecords.length
        })
      }

      this.setData({
        showReport: true,
        reportData: {
          weekRate,
          monthRate,
          weekTaken,
          weekTotal,
          weekChart,
          chartMaxTotal: Math.max(...weekChart.map(c => c.total), 1),
          topMed: topMed ? topMed[0] : '暂无',
          topMedCount: topMed ? topMed[1] : 0,
          totalRecords: allRecords.length,
          generatedAt: `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}`
        }
      })
      wx.hideLoading()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '生成失败', icon: 'none' })
    }
  },

  closeReport() {
    this.setData({ showReport: false })
  },

  // === 补录功能 ===
  toggleCatchUp() {
    const show = !this.data.showCatchUp
    if (show) this.loadCatchUpMedications()
    this.setData({
      showCatchUp: show,
      'catchUpForm.medicationIndex': null,
      'catchUpForm.medicationId': '',
      'catchUpForm.medicationName': '',
      'catchUpForm.date': '',
      'catchUpForm.time': ''
    })
  },

  loadCatchUpMedications() {
    const db = wx.cloud.database()
    db.collection('medications').limit(100).get().then(res => {
      this.setData({ catchUpMedications: res.data || [] })
    }).catch(() => {
      const meds = wx.getStorageSync('medications') || []
      this.setData({ catchUpMedications: meds })
    })
  },

  onCatchUpMedChange(e) {
    const index = e.detail.value
    const med = this.data.catchUpMedications[index]
    if (med) {
      this.setData({
        'catchUpForm.medicationIndex': index,
        'catchUpForm.medicationId': med._id,
        'catchUpForm.medicationName': med.name
      })
    }
  },

  onCatchUpDateChange(e) {
    this.setData({ 'catchUpForm.date': e.detail.value })
  },

  onCatchUpTimeChange(e) {
    this.setData({ 'catchUpForm.time': e.detail.value })
  },

  async saveCatchUp() {
    const form = this.data.catchUpForm
    if (!form.medicationId) {
      wx.showToast({ title: '请选择药品', icon: 'none' })
      return
    }
    if (!form.date) {
      wx.showToast({ title: '请选择日期', icon: 'none' })
      return
    }
    if (!form.time) {
      wx.showToast({ title: '请选择时间', icon: 'none' })
      return
    }

    wx.showLoading({ title: '保存中...' })
    try {
      const recordTime = new Date(`${form.date}T${form.time}:00`)
      const db = wx.cloud.database()
      await db.collection('records').add({
        data: {
          medicineName: form.medicationName,
          status: 'taken',
          recordTime: recordTime,
          createTime: recordTime,
          isCatchUp: true
        }
      })
      wx.hideLoading()
      wx.showToast({ title: '补录成功', icon: 'success' })

      this.setData({
        showCatchUp: false,
        'catchUpForm.medicationIndex': null,
        'catchUpForm.medicationId': '',
        'catchUpForm.medicationName': '',
        'catchUpForm.date': '',
        'catchUpForm.time': ''
      })
      this.loadData()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '补录失败', icon: 'none' })
    }
  }
})

function formatDayKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDate(date) {
  const d = new Date(date)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function formatTime(date) {
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
