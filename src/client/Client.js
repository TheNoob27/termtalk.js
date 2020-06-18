const Requests = require("./requests/Requests.js")
const { TypeError } = require("../errors")
const Server = require("../structures/Server.js")

class Client {
  constructor(options) {
    this.requests = new Requests(this)
    this.options = this.parseOptions(options)
  }
  
  get rest() {
    return this.requests
  }
  
  get token() {
    return this.servers.size === 1 ? this.servers.cache.first().token : null
  }
  
  get tokens() {
    return this.servers.cache.map(s => s.token)
  }
  
  parseOptions(data) {
    const defaultOptions = {
      ip: "localhost", 
      port: 3000
    },
    options = {}
    
    if (!data || typeof data !== "object") return defaultOptions
    
    if ("ip" in data && (typeof data.ip !== "string" && !(data.ip instanceof Array) || data.ip.length <= 1)) throw new TypeError("OPTIONS_INVALID")
    if ("port" in data && (typeof data.port !== "number" || isNaN(options.port))) throw new TypeError("OPTIONS_INVALID")
    
    for (const k of Object.keys(defaultOptions)) {
      options[k] = data[k] || defaultOptions[k]
    }
    
    return options
  }
}

module.exports = Client
