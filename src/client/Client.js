const EventEmitter = require("events")
const RequestsManager = require("./requests/RequestsManager.js")
const { Error, TypeError, RangeError, APIError } = require("../errors")
const Server = require("../structures/Server.js")
const ServerManager = require("../managers/ServerManager.js")
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
    console.log(this.options.ip.map((ip, i) => console.log(i) || ({ ip, port: this.options.port[i], id: i })))
    this.servers = new ServerManager(this, 
      this.options.ip.map((ip, i) => console.log(i) || ({ ip, port: this.options.port[i], id: i }))
    )
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
    return this.servers.cache.find(s => s.clientMember && s.clientMember) || {}
  }
  
  get channels() {
    const channels = new Collection()
    const single = this.servers.cache.size === 1
    for (const server of this.servers.cache.values()) {
      for (const [name, channel] of server.channels.cache) {
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

  get users() {
    const users = new Collection()
    for (const server of this.servers.cache.values()) {
      for (const member of server.members.cache.values()) {
        users.set(member.id, member)
      }
    }

    return {
      client: this,
      cache: users
    }
    // to be similar to every other manager
  }
  
  create({ id, username, tag, uid: _ = null, ownerID, ownerUid = null, ownerPassword, ip, port } = {}, autoLogin = false) {
    if (_ && !id) id = _
    if (ownerUid && !ownerID) ownerID = ownerUid
    if (!ip || !port) {
      if (this.servers.cache.size) {
        let available = this.servers.cache.find(s => !s.ready && s.ip)
        if (available) console.log("available: ", available.id) || ({ ip = ip , port = port } = available)
      } // no available vvv
      if ((!ip || !port) && this.options.ip.length) [ [ip = ip], [port = port] ] = [this.options.ip, this.options.port]
    }
    console.log("ip, port:", ip, port)
    
    const data = [id, username, tag, ownerID, ownerPassword, ip, port]
    if (data.some(i => !i)) return Promise.reject(new Error("BOT_CREATE_INFO"))
    if (data.slice(0, -1).some(i => typeof i !== "string") || typeof port !== "number") return Promise.reject(new TypeError("BOT_CREATE_TYPE"))
    
    const server = this.servers.add({ ip, port })
    console.log("creatbit", server.id)
    this.emit("debug", `Created a server. IP: ${ip}, Port: ${port}. Creating bot now...`)

    return this.api.server(server).bots.create.post({
      ownerUid: ownerID,
      ownerPassword: ownerPassword,
      uid: id,
      username,
      tag
    }).then(({ token } = {}) => {
      this.emit("debug", `Bot has been created${autoLogin ? ", logging in..." : "."}`)
      if (!this.options.ip) this.options.ip = ip
      if (!this.options.port) this.options.port = port
      
      
      server._patch({ token })
      if (autoLogin) return this.login({ token, server })
      return server
    }).catch(e => {
      throw e instanceof Object.getPrototypeOf(Error) ? e : new APIError(e)
    })
  }
  
  login(options) {
    let { ip, port, token, server: s } = options || {}
    if (typeof options === "string") token = options
    if (![ip, token, s].some(Boolean)) {
      s = this.servers.cache.find(s => !s.ready && s.token && s.ip && s.port)
      if (!s) return Promise.reject(new Error("NO_LOGIN_OPTIONS"))
    }

    let server = s instanceof Server ? s : this.servers.cache.find(s => !s.ready && s.token && s.token === token)
    if (!server && (!ip || !port) && token) {
      let available = this.servers.cache.find(s => !s.ready && s.ip)
      if (available) ({ ip, port, token = token} = available)
    }

    //console.log(ip, port, token, this.servers.cache)

    if (!server && !(ip || port)) return Promise.reject(new Error("INVALID_TOKEN"))
    if (!server && ip) server = this.servers.cache.find(s => s.ip === ip)
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
    if ("port" in data && (typeof data.port !== "number" && !(data.ip instanceof Array))) throw new TypeError("OPTIONS_INVALID")
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
    
    console.log(options)
    return options
  }
  
  static create({ options, ...extra } = {}, autoLogin) {
    const client = new this(options)
    return client.create(extra, autoLogin)
  }
}

module.exports = Client
