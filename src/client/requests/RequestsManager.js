const createRoute = require("./API.js")
const APIError = require("../../errors/APIError.js")

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

  request(data = {}, options) {
    let token = data.server && data.server.token || this.client.token
    Object.assign(data, {
      headers: {
        "Content-Type": data.method !== "GET" ? "application/json" : "application/x-www-form-urlencoded",
        ...(token ? { Authorization: `Bot ${token}` } : {})
      }
    })
    
    if (data.server && data.server.sessionID || this.client.user.sessionID) Object.assign(options || (options = {}), {
      sessionID: data.server && data.server.sessionID || this.client.user.sessionID
    })
    
    if (options && typeof options === "object") { 
      if (data.method === "GET") data.path += this._toQuery(options)
      else options = JSON.stringify(options)
    }
    
    return new Promise((resolve, reject) => {
      const http = data.server ? data.server.http || this.client.http : this.client.http
      
      const request = http.request(data, res => {
        const status = res.statusCode

        let data = ""
        res.setEncoding('utf8')
        res.on('data', (chunk) => data += chunk)
        res.on('end', () => {
          if (res.headers["content-type"] === "application/json") data = JSON.parse(data)
          
          if (status < 200 || status >= 300) reject(new APIError(data))
          else resolve(data)
        })
      })

      request.on("error", reject)

      if (data.method === "POST") request.write(options)
      request.end()
    })
  }
  
  _toQuery(json) {
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
