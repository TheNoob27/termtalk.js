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

  request(data = {}, options) {
    Object.assign(data, {
      headers: {
        Authorization: `Bot ${this.client.token}`,
       "Content-Type": data.method !== "GET" ? "application/json" : "application/x-www-form-urlencoded" 
      }
    })
    
    if (data.server && data.server.sessionID || this.client.sessionID) Object.assign(options, {
      sessionID: data.server && data.server.sessionID || this.client.sessionID // prob not gonna work (user session) but eh lol their fault
    })
    
    if (options && typeof options === "object") { 
      if (data.method === "GET") data.path += this._stringifyOptions(options)
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
          
          if (status < 200 || status >= 300) reject(data)
          else resolve(data)
        })
      })

      request.on("error", reject)

      if (data.method === "POST") request.write(options)
      request.end()
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
