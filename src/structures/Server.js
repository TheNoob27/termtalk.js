const Base = require("./Base.js")
const MemberManager = require("../managers/MemberManager.js")
const ChannelManager = require("../managers/ChannelManager.js")
const io = require("socket.io-client") // uh
const { Error } = require("../errors")

class Server extends Base {
  constructor(client, data) {
    super(client)
    this.id = !this.client.servers ? data.id : this.client.servers.cache.size // client.servers isnt set yet
    this.readyAt = null
    this.socket = null
    
    this.members = new MemberManager(this)
    this.channels = new ChannelManager(this)
    
    if (data) this._patch(data)
  }
  
  get sessionID() {
    return this.clientMember && this.clientMember.user.sessionID
  }
  
  get ready() {
    return this.readyAt != null
  }
  
  _patch(data) {
    if (data.token) Object.defineProperty(this, "token", { value: data.token, writable: true })
    if (typeof data.ip === "string") {
      this.ip = data.ip.startsWith("http") ? data.ip : `http://${data.ip}`
      this.http = this.secure ? require("https") : require("http")
    }
    
    if (data.port) this.port = data.port

    if (data.channels) {
      this.channels.cache.clear()
      for (const channel of data.channels) this.channels.add(channel)
    }
    
    if (data.members) {
      this.members.cache.clear()
      for (const member of data.members) this.members.add(member)
    }
  }

  get me() {
    return this.clientMember
  }
  
  login(deleteReject = false) {
    if (!this.token) return Promise.reject(new Error("NO_TOKEN"))

    const connect = new Promise((resolve, reject) => {
      const socket = io(this.host, {
        reconnectionAttempts: 10,
        timeout: 30000,
        secure: this.secure
      })

      socket.on("methodResult", console.log)
      
      const clean = (fn, a) => {
        socket.removeAllListeners()
        return fn(a)
      }
      
      socket.once("connect", () => {
        socket.once("methodResult", data => {
          return data.success ? clean(resolve, socket) : clean(reject, data)
        })
      })
      
      socket.on("reconnect_failed", () => {
        return clean(reject, new Error("CONNECTION_FAILED"))
      })
    })
    
    return connect.then(s => {
      this.socket = s
      this.client.emit("debug", `A connection to the server has been established.`)

      return new Promise((resolve, reject) => { // only using promises to reject/resolve 
        // result from authenticating
        this.socket.on("authResult", d => {
          console.log("autho notice me")
          if (!d.success) {
            this.socket.close(true)
            return reject(d)
          }

          this.client.emit("debug", `Successfully connected and authenticated.`)
          
          d.bot.bot = true
          this.clientMember = this.members.add(d.bot)
          return this.fetch().then(d => {
            this.load()
            .readyAt = Date.now()
            if (this.client.servers.cache.every(g => g.ready)) this.client.emit("ready")
            return d
          }).then(resolve).catch(reject)
        })
        
        // login to the server
        console.log({
          bot: true, // what if i set to false :flushed:
          token: this.token,
        });
        this.socket.emit("login", {
          bot: true, // what if i set to false :flushed:
          token: this.token
        })
      }).catch(e => {
        if (deleteReject) this.client.servers.cache.delete(this.id)
        throw e
      })
    }).catch(e => {
      if (deleteReject) this.client.servers.cache.delete(this.id)
      throw e
    })
  }

  get connect() {
    return this.login
  }
  
  async fetch() {
    this.client.emit("debug", `Fetching members and channels from server ${this.id}.`)
    const data = {
      channels: await this.api.channels.get().then(d => d.channels),
      members: await this.api.members.get().then(d => d.members)
    }
    
    this._patch(data)
    return this
  }
   
  load() {
    if (this.ready || !this.socket) return false
    
    this.emit("debug", `Loading events for this server...`);

    this.socket.on("memberConnect", ({ data } = {}) => this.client.emit("memberJoin", this.members.add(data)))
    this.socket.on("memberDisconnect", ({ data } = {}) => this.client.emit("memberLeave", this.members.add(data, { cache: false })))
    
    this.socket.on("msg", data => {
      const channel = this.channels.add({ name: data.channel })
      data.channel = channel
      return this.client.emit("message", channel.messages.add(data))
    })
    
    // oh thats it?
    return this
  }

  get host() {
    return `${this.ip}:${this.port}`
  }

  get secure() {
    return this.name.startsWith("https")
  }
  
  get name() {
    return this.ip || ""
  }

  get api() {
    return this.client.api.server(this)
  }
  
  toString() {
    return this.host
  }
}

module.exports = Server
