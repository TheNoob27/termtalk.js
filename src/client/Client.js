const EventEmitter = require("events")
const RequestsManager = require("./requests/RequestsManager.js")
const { Error, TypeError, RangeError } = require("../errors")
const Server = require("../structures/Server.js")
const ServerManager = require("../managers/ServerManager.js")
const UserManager = require("../managers/UserManager.js")
const Collection = require("../util/Collection.js")

class Client extends EventEmitter {
  constructor(options) {
    super()
    Object.defineProperty(this, "http", {
      value: require("http"), // default http
      writable: true // no enumerability for me
    })
    this.options = this.parseOptions(options)
    
    this.requests = new RequestsManager(this)
    this.servers = new ServerManager(this, 
      this.options.ip.map((ip, i) => console.log(i) || ({ ip, port: this.options.port[i], id: i }))
    )
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
  
  create({ id, username, tag, uid: _ = null, ownerID, ownerUid = null, ownerPassword, ip = this.options.ip[0], port = this.options.port[0] } = {}, autoLogin = false) {
    if (_ && !id) id = _
    if (ownerUid && !ownerID) ownerID = ownerUid
    const data = [id, username, tag, ownerID, ownerPassword, ip, port]
    if ((!ip || !port) && this.options.ip.length) [ ip = ip, port = port ] = [this.options.ip, this.options.port]

    if (data.some(i => !i)) return Promise.reject(new Error("BOT_CREATE_INFO"))
    if (data.slice(0, -1).some(i => typeof i !== "string") || typeof port !== "number") return Promise.reject(new TypeError("BOT_CREATE_TYPE"))
    
    const server = this.servers.add({ ip, port })
    this.emit("debug", `Created a server. IP: ${ip}, Port: ${port}. Creating bot now...`)

    return this.api.server(server).bots.create.post({
      ownerUid: ownerID,
      ownerPassword: ownerPassword,
      uid: id,
      username,
      tag
    }).then(({ token } = {}) => {
      this.emit("debug", `Bot has been created`)
      if (!this.options.ip) this.options.ip = ip
      if (!this.options.port) this.options.port = port
      
      this.users.add({ 
        uid: id, 
        username, tag, 
        bot: true,
        ownerUid, ownerPassword,
        id // yes its uid but it'll be _patched later
      })
      
      server._patch({ token })
      if (autoLogin) return this.login({ token, server })
      return server
    })
  }
  
  login(options) {
    let { ip = this.options.ip[0], port = this.options.port[0], token, server: s } = options || {}
    if (typeof options === "string") token = options
    
    let server = s instanceof Server ? s : this.servers.cache.find(s => s.token === token)
    if (!server && !(ip || port)) return Promise.reject(new Error("INVALID_TOKEN"))
    if (!server) server = this.servers.cache.find(s => s.ip === ip)
    if (server) {
      this.emit("debug", `Connecting to the server now...`)
      if (!server.token) server._patch({ token })
      return server.login()
    }
    
    if (!ip || !port || !token) return Promise.reject(new Error("OPTIONS_INVALID"))
    server = this.servers.add({ ip, port, token })
    this.emit("debug", `Connecting to the server now...`)
    return server.login(true)
  }

  get connect() {
    return this.login
  }
  
  parseOptions(data) {
    const defaultOptions = {
      ip: ["localhost"], // lol ik you cant do public with this but thats their fault
      port: [3000], // random port
      messageCacheSize: 30
      // idk more options soon
    },
    options = {}
    
    if (!data || typeof data !== "object") return defaultOptions
    
    if ("ip" in data && (typeof data.ip !== "string" && !(data.ip instanceof Array) || !data.ip.length)) throw new TypeError("OPTIONS_INVALID")
    if ("port" in data && (typeof data.port !== "number" || isNaN(data.port))) throw new TypeError("OPTIONS_INVALID")
    // 1 is not array and other is array
    if ([Array.isArray(data.port), Array.isArray(data.ip)].reduce((prev, a) => a === prev ? a : null) === null) throw new TypeError("OPTIONS_INVALID")
    if (Array.isArray(data.ip) ? data.ip.length !== data.port.length : false) throw new RangeError("OPTIONS_LENGTH")
    
    
    if ("messageCacheSize" in data && typeof data.messageCacheSize !== "number") throw new TypeError("OPTIONS_INVALID")
    
    for (const k of Object.keys(defaultOptions)) {
      options[k] = data[k] == null ? defaultOptions[k] : data[k]
    }
    
    if (![data.ip, data.port].every(Array.isArray)) Object.assign(options, {
      ip: [data.ip].flat(),
      port: [data.port].flat()
    })
    
    return options
  }
  
  static create({ options, ...extra } = {}, autoLogin) {
    const client = new this(options)
    return client.create(extra, autoLogin)
  }
}

module.exports = Client
