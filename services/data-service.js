class DataService {
  clearAllCache() { try { wx.setStorageSync('todayReminders',[]); wx.setStorageSync('allReminders',[]) } catch(e) {} }
  async getWithFallback(collection, storageKey, where={}, options={}) {
    try { const db = wx.cloud.database(); let q = db.collection(collection).where(where);
      if(options.orderBy) q = q.orderBy(options.orderBy.field, options.orderBy.direction||'desc');
      const r = await q.get(); this._setCache(storageKey, r.data||[]); return r.data||[] }
    catch(e) { return this._getCache(storageKey) }
  }
  _setCache(k,d) { try { wx.setStorageSync(k,d) } catch(e) {} }
  _getCache(k) { try { return wx.getStorageSync(k)||[] } catch(e) { return [] } }
}
module.exports = new DataService()
