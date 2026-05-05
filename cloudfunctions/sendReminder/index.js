const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const TEMPLATE_IDS = {
  reminder: 'So9QakVG08t0VhN3gMcUyU9P39dCWKq_rpWB9usWoqk'
}

exports.main = async (event, context) => {
  if (event.action === 'check') {
    const db = cloud.database()
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    try {
      const { data: reminders } = await db.collection('reminders')
        .where({ enabled: true, time: currentTime })
        .get()

      const results = []
      for (const r of reminders) {
        const sendResult = await sendMessage(r.medicationName || r.medicineName, r.time)
        results.push(sendResult)
      }

      return { success: true, sent: results.length, results }
    } catch (err) {
      console.error('检查提醒失败:', err)
      return { success: false, error: err.message }
    }
  }

  return sendMessage(event.medicineName, event.time)
}

async function sendMessage(medicineName, time) {
  try {
    const { OPENID } = cloud.getWXContext()

    const result = await cloud.openapi.subscribeMessage.send({
      touser: OPENID,
      page: 'pages/index/index',
      templateId: TEMPLATE_IDS.reminder,
      data: {
        thing1: { value: medicineName || '药品' },
        time2: { value: time || '请按时服药' },
        thing3: { value: '请按时服用药品' }
      }
    })

    return { success: true, result }
  } catch (err) {
    console.error('消息发送失败:', err)
    return { success: false, error: err.message }
  }
}
