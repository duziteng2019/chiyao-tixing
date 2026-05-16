const { STORAGE_KEYS } = require('../constants/storage')
class SyncManager {
  async syncAll() { const queue = this._getQueue(); let s = 0; for (const op of queue) { try { await this._processOperation(op); s++ } catch(e) {} } if(s>0) this._setQueue([]); return {offlineQueue:s} }
  getOfflineQueueSize() { return this._getQueue().length }
  async pushToCloud(op) { try { await this._processOperation(op) } catch(e) { this._addToQueue(op); throw e } }
  async _processOperation(op) {
    const db = wx.cloud.database()
    switch(op.type) {
      case 'add': return db.collection(op.collection).add({data: op.data})
      case 'update': return db.collection(op.collection).doc(op.docId).update({data: op.data})
      case 'delete': return db.collection(op.collection).doc(op.docId).remove()
      case 'markTaken': return db.collection(op.collection).add({data: op.data})
    }
  }
  _getQueue() { try { return wx.getStorageSync(STORAGE_KEYS.SYNC_QUEUE) || [] } catch(e) { return [] } }
  _setQueue(q) { try { wx.setStorageSync(STORAGE_KEYS.SYNC_QUEUE, q) } catch(e) {} }
  _addToQueue(op) { const q = this._getQueue(); q.push({...op,_queueTime:Date.now()}); this._setQueue(q) }
}
module.exports = new SyncManager()
