const cloud = require('wx-server-sdk')
const MAX_RETRY = 3
const RETRY_BASE_DELAY = 2000

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const TEMPLATE_IDS = {
  reminder: 'So9QakVG08t0VhN3gMcUyU9P39dCWKq_rpWB9usWoqk'
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function logPushResult(db, reminderId, userId, status, detail) {
  try {
    await db.collection('push_logs').add({
      data: {
        reminderId,
        userId,
        status,
        detail: String(detail || '').slice(0, 500),
        createTime: new Date()
      }
    })
  } catch (e) {
    console.log('写入推送日志失败:', e.message)
  }
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  // 定时器触发：仅记录诊断信息，不做推送
  if (event.action === 'check' || !event.reminderId) {
    return { success: true, mode: 'timer_tick', message: '定时器触发 — 推送仅在用户主动授权后触发' }
  }

  // 按需推送：用户在前端授权后调用
  return await sendSingleReminder(event.reminderId, event.targetOpenid || wxContext.OPENID)
}

async function sendSingleReminder(reminderId, targetOpenid) {
  if (!targetOpenid) {
    return { success: false, error: 'MISSING_OPENID', message: '缺少目标用户 openid' }
  }

  const db = cloud.database()

  try {
    const { data } = await db.collection('reminders').doc(reminderId).get()
    if (!data) {
      return { success: false, error: 'NOT_FOUND', message: '提醒不存在' }
    }

    const medicineName = data.medicationName || data.medicineName || '药品'
    const time = data.time || '请按时'

    const result = await cloud.openapi.subscribeMessage.send({
      touser: targetOpenid,
      page: 'pages/index/index',
      templateId: TEMPLATE_IDS.reminder,
      data: {
        thing1: { value: medicineName },
        time2: { value: time },
        thing3: { value: '请按时服药' }
      }
    })

    await logPushResult(db, reminderId, targetOpenid, 'success', JSON.stringify(result))

    return { success: true, result }
  } catch (err) {
    await logPushResult(db, reminderId, targetOpenid, 'failed', err.message)
    return { success: false, error: err.message }
  }
}
