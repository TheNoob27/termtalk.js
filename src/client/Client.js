const RequestsManager = require("./requests/RequestsManager.js")
const { Error, TypeError, RangeError } = require("../errors")
const Server = require("../structures/Server.js")
const ServerManager = require("../managers/ServerManager.js")
const UserManager = require("../managers/UserManager.js")

class Client {
  constructor(options) {
    this.http = require("http") // default http
    this.options = this.parseOptions(options)
    
    this.requests = new RequestsManager(this)
    this.servers = new ServerManager(this, [
      this.options.ip.map((ip, i) => ({ ip, port: this.options.port[i] }))
    ])
  }
  
  get api() {
    return this.requests.api
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
  
  create({ id, username, tag, uid: _, ownerID, ownerUid, ownerPassword, ip, port } = {}) {
    if (_ && !id) id = _
    if (ownerUid && !ownerID) ownerID = ownerUid
    const data = [id, username, tag, ownerID, ownerPassword, ip, port]
    
    if (data.some(i => !i)) return Promise.reject(new Error("BOT_CREATE_INFO"))
    if (data.slice(0, -1).some(i => typeof i !== "string") || typeof port !== "number") return Promise.reject(new TypeError("BOT_CREATE_TYPE"))
    
    const server = this.servers.add({ ip, port }, { cache: false })
    
    return this.api.server(server).bots.create.post({
      ownerUid: ownerID,
      ownerPassword: ownerPassword,
      uid: id,
      username,
      tag
    }).then(({ token }) => {
      if (!this.options.ip || typeof this.options.ip === "string") this.options.ip = ip
      if (!this.options.port || typeof this.options.port === "number") this.options.port = port
      
      return this.servers.add({ ip, port, token })
    })
  }
  
  login({ ip, port, token }) {
    const server = this.servers.cache.find(s => s.token === token)
    if (!server && !(ip || port)) return Promise.reject(new Error("INVALID_TOKEN"))
    if (!server) server = this.servers.cache.find(s => s.ip === ip)
    if (server) return server.login()
    
    if (!ip || !port || !token) return Promise.reject(new Error("OPTIONS_INVALID"))
    server = this.servers.add({ ip, port, token })
    return server.login(true)
  }
  
  parseOptions(data) {
    const defaultOptions = {
      ip: "localhost", // lol ik you cant but thats their fault
      port: 3000 // random port
      // idk more options soon
    },
    options = {}
    
    if (!data || typeof data !== "object") return defaultOptions
    
    if ("ip" in data && (typeof data.ip !== "string" && !(data.ip instanceof Array) || !data.ip.length)) throw new TypeError("OPTIONS_INVALID")
    if ("port" in data && (typeof data.port !== "number" || isNaN(options.port))) throw new TypeError("OPTIONS_INVALID")
    // 1 is not array and other is array
    if ([Array.isArray(data.port), Array.isArray(data.ip)].reduce((prev, a) => a === prev ? a : null) === null) throw new TypeError("OPTIONS_INVALID")
    if (Array.isArray(data.ip) ? data.ip.length !== data.port.length : false) throw new RangeError("OPTIONS_LENGTH")
    
    if (!Array.isArray(data.ip)) Object.assign(data, {
      ip: [data.ip],
      port: [data.port]
    })
    
    for (const k of Object.keys(defaultOptions)) {
      options[k] = data[k] || defaultOptions[k]
    }
    
    return options
  }
  
}

module.exports = Client
