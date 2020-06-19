const EventEmitter = require("events")
const RequestsManager = require("./requests/RequestsManager.js")
const { Error, TypeError, RangeError } = require("../errors")
const Server = require("../structures/Server.js")
const ServerManager = require("../managers/ServerManager.js")
const UserManager = require("../managers/UserManager.js")
const Collection = require("../util/Collection.js")

class Client extends EventEmitter {
  constructor(options) {
    this.http = require("http") // default http
    this.options = this.parseOptions(options)
    
    this.requests = new RequestsManager(this)
    this.servers = new ServerManager(this, [
      this.options.ip.map((ip, i) => ({ ip, port: this.options.port[i] }))
    ])
    this.users = new UserManager(this)
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
  
  get sessionID() {
    return this.servers.cache.size === 1 ? this.servers.cache.first().sessionID : null
  }
  
  get user() {
    return this.servers.cache.find(s => s.clientMember && s.clientMember.user)
  }
  
  get channels() {
    const channels = new Collection()
    const single = this.servers.cache.size === 1
    for (const server of this.servers.cache.values()) {
      for (const [name, channel] of server.channels.cache.keys()) {
        if (!single && (name === "General" || channels.has(name))) {
          channels.set(`${name}_${server.id}`, channel)
          if (channels.has(name)) {
            let old = channels.get(name)
            channels.set(`${name}_${old.server.id}`, old)
            channels.delete(name)
          }
        } else channels.set(name, channel)
      }
    }
    
    return {
      client: this,
      cache: channels 
    }
    // to be similar to every other manager
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
    }).then(({ token } = {}) => {
      if (!this.options.ip || typeof this.options.ip === "string") this.options.ip = ip
      if (!this.options.port || typeof this.options.port === "number") this.options.port = port
      
      this.users.add({ 
        uid: id, 
        username, tag, 
        bot: true,
        ownerUid, ownerPassword
        id // yes its uid but it'll be _patched later
      })
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
      port: 3000, // random port
      messageCacheSize: 30
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
    
    if ("messageCacheSize" && typeof options.messageCacheSize !== "number") throw new TypeError("OPTIONS_INVALID")
    
    for (const k of Object.keys(defaultOptions)) {
      options[k] = data[k] == null ? defaultOptions[k] : data[k]
    }
    
    return options
  }
  
}

module.exports = Client
