const RequestsManager = require("./requests/RequestsManager.js")
const { TypeError } = require("../errors")
const Server = require("../structures/Server.js")
const ServerManager = require("../managers/ServerManager.js")

class Client {
  constructor(options) {
    this.options = this.parseOptions(options)
    this.requests = new RequestsManager(this)
    this.servers = new ServerManager(this, [
      this.options.ip instanceof Array ? 
      this.options.ip.map((ip, i) => ({ ip, port: this.options.port[i] })) :
      { ip: this.options.ip, port: this.options.port }
    ])
  }
  
  get rest() {
    return this.requests
  }
  
  get token() {
    return this.servers.cache.size === 1 ? this.servers.cache.first().token : null
  }
  
  get tokens() {
    return this.servers.cache.map(s => s.token)
  }

  get server() {
    return this.servers.cache.size === 1 ? this.servers.cache.first() : null
  }
  
  parseOptions(data) {
    const defaultOptions = {
      ip: "localhost", // lol ik you cant but thats their fault
      port: 3000 // random port
    },
    options = {}
    
    if (!data || typeof data !== "object") return defaultOptions
    
    if ("ip" in data && (typeof data.ip !== "string" && !(data.ip instanceof Array) || data.ip.length <= 1)) throw new TypeError("OPTIONS_INVALID")
    if ("port" in data && (typeof data.port !== "number" || isNaN(options.port))) throw new TypeError("OPTIONS_INVALID")
    // 1 is not array and 2 is array
    if ([Array.isArray(data.port), Array.isArray(data.ip)].reduce((prev, a) => a === prev ? a : null) === null) throw new TypeError("OPTIONS_INVALID")
    
    for (const k of Object.keys(defaultOptions)) {
      options[k] = data[k] || defaultOptions[k]
    }
    
    return options
  }
}

module.exports = Client
