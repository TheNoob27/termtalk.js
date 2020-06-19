const Collection = require("../util/Collection.js")

class Base {
  constructor(client) {
    Object.defineProperty(this, client, { value: client })
  }
  
  _patch() {}
  
  valueOf() {
    return this.id != null ? this.id : super.valueOf()
  }
  
  toJSON(ignore) {
    if (!(ignore instanceof Array)) ignore = []
    
    const keys = Object.keys(this).filter(k => !k.startsWith('_') && !ignore.includes(k))
    const json = {}
    
    // long code big boi code
    for (const key of keys) json[key] = this[key] instanceof Collection ? this[key].keys() : this[key] && typeof this[key] === "object" && typeof this[key].valueOf === "function" ? this[key].valueOf() : this[key]
    
    return json
  }
}

module.exports = Base
