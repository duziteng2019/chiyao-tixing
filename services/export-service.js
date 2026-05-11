const { STORAGE_KEYS } = require('../constants/storage')

class ExportService {
  exportToCSV(dataArray, headers, filename) {
    if (!dataArray || dataArray.length === 0) {
      throw new Error('没有数据可导出')
    }

    const bom = '\uFEFF'
    const csvHeader = headers.map(h => h.label).join(',')
    const csvRows = dataArray.map(item => {
      return headers.map(h => {
        const value = item[h.key] ?? ''
        const strValue = String(value)
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          return `"${strValue.replace(/"/g, '""')}"`
        }
        return strValue
      }).join(',')
    })

    const csvContent = bom + csvHeader + '\n' + csvRows.join('\n')
    this._saveAndShare(csvContent, `${filename}.csv`, 'csv')
  }

  exportMedications() {
    const medications = wx.getStorageSync(STORAGE_KEYS.MEDICATIONS) || []
    const headers = [
      { key: 'name', label: '药品名称' },
      { key: 'dosage', label: '剂量' },
      { key: 'frequency', label: '服用频率' },
      { key: 'totalQuantity', label: '总量' },
      { key: 'remainingQuantity', label: '剩余' },
      { key: 'startDate', label: '开始日期' },
      { key: 'endDate', label: '结束日期' },
      { key: 'notes', label: '备注' }
    ]
    this.exportToCSV(medications, headers, '药品清单')
  }

  exportRecords() {
    const records = wx.getStorageSync(STORAGE_KEYS.TODAY_RECORDS) || []
    const headers = [
      { key: 'medicineName', label: '药品名称' },
      { key: 'time', label: '时间' },
      { key: 'status', label: '状态' }
    ]
    this.exportToCSV(records, headers, '服药记录')
  }

  exportFullBackup() {
    const data = {
      version: '1.0.0',
      exportTime: new Date().toISOString(),
      medications: wx.getStorageSync(STORAGE_KEYS.MEDICATIONS) || [],
      reminders: wx.getStorageSync(STORAGE_KEYS.REMINDERS) || [],
      records: wx.getStorageSync(STORAGE_KEYS.TODAY_RECORDS) || [],
      userInfo: wx.getStorageSync(STORAGE_KEYS.USER_INFO) || {}
    }

    const jsonContent = JSON.stringify(data, null, 2)
    this._saveAndShare(jsonContent, `吃药提醒备份_${this._getDateStr()}.json`, 'json')
  }

  _saveAndShare(content, filename, type) {
    const fs = wx.getFileSystemManager()
    const filePath = `${wx.env.USER_DATA_PATH}/${filename}`

    fs.writeFile({
      filePath,
      data: content,
      encoding: 'utf8',
      success: () => {
        wx.showToast({ title: '导出成功', icon: 'success' })

        wx.shareFileMessage({
          filePath,
          fileName: filename,
          success: () => {
            console.log('分享成功')
          },
          fail: (err) => {
            console.log('分享失败，文件已保存到:', filePath)
          }
        })
      },
      fail: (err) => {
        console.error('导出失败:', err)
        wx.showToast({ title: '导出失败', icon: 'none' })
      }
    })
  }

  _getDateStr() {
    const now = new Date()
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  }
}

module.exports = new ExportService()
