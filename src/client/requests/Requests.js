const createRoute = require("./API.js")

class RequestsManager {
  constructor(client) {
    this.client = client
  }

  get api() {
    return createRoute(this)
  }

  get make() {
    return this.request
  }

  request(data, options) {
    Object.assign(data, {
      headers: {
        Authorization: `Bot ${this.client.token}`,
       "Content-Type": "application/x-www-form-urlencoded"
      }
    })
  }
  
  _stringifyQuery(json) {
    if (!json || typeof json !== "object") return ""
    let str = "?"
    let f = s => encodeURIComponent(typeof s === "number" && isFinite(s) ? s : typeof s !== "number" ? s : "")
    
    for (const [key, val] of Object.entries(json)) {
      let prop = f(key)
      if (!prop) continue;
      
      let value = !Array.isArray(val) ? f(val) : val.map(f).filter(v => v !== "").join(`&${prop}=`)
      if (!value) continue;
      
      str += `${prop}=${value}`
    }
    
    return str === "?" ? "" : str
  }
}

module.exports = RequestsManager
