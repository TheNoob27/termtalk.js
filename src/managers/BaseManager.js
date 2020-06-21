const Collection = require("../util/Collection.js")

class BaseManager {
  constructor(client, dataType, data, Cache = Collection, ...options) {
    Object.defineProperties(this, {
      client: { value: client },
      dataType: { value: dataType }
    })
    
    this.cache = new Cache(...options)
    if (data) for (const d of data) this.add(d, console.log("adding: "), console.log(d))
  }
  
  add(data, { id, cache = true, extras = [] } = {}) {
    const exists = this.cache.get(id || data.id)
    if (exists && exists._patch && cache) exists._patch(data)
    if (exists) return exists
    
    const entry = this.dataType ? new this.dataType(this.client, data, ...extras) : data
    if (cache) this.cache.set(id || entry.id, entry)
    return entry
  }
  
  resolve(data = {}) {
    if (data instanceof this.dataType) return data
    if (typeof data === "string") return this.cache.get(data) || null
    
    return null
  }
}

module.exports = BaseManager
