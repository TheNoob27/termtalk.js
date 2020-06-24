const Base = require("./Base.js")
const MemberManager = require("../managers/MemberManager.js")
const ChannelManager = require("../managers/ChannelManager.js")
const io = require("socket.io-client") // uh
const { Error, messages } = require("../errors")

class Server extends Base {
  constructor(client, data) {
    super(client)
    
    this.id = !this.client.servers ? data.id : this.client.servers.cache.size // client.servers isnt set yet
    this.readyAt = null
    this.socket = null
    
    this.members = new MemberManager(this)
    this.memberCount = 0
    this.channels = new ChannelManager(this)
    
    if (data) this._patch(data)
  }
  
  get sessionID() {
    return this.clientMember && this.clientMember.sessionID
  }
  
  get ready() {
    return this.readyAt != null
  }
  
  _patch(data) {
    if (data.token) Object.defineProperty(this, "token", { value: data.token, writable: true })
    if (typeof data.ip === "string") {
      if (data.secure && !data.ip.startsWith("https")) data.ip = "https://" + data.ip.replace(/https?:\/\//, "") // just to make sure :^)
      this.ip = data.ip.startsWith("http") ? data.ip : `http://${data.ip}`
      this.http = this.secure ? require("https") : require("http")
    } else if (data.secure && typeof this.ip === "string" && !this.ip.startsWith("https")) {
      this.ip = `https://${this.ip.startsWith("http") ? this.ip.slice(7) : this.ip}`
    }
    if (typeof this.ip !== "string") this.ip = ""
    
    if (data.port) this.port = data.port

    if (data.channels) {
      this.channels.cache.clear()
      for (const channel of data.channels) this.channels.add(channel)
    }
    
    if (data.members instanceof Array) {
      this.members.cache.clear()
      for (const member of data.members) this.members.add(member)
      this.memberCount = this.members.cache.size
    }
    
    if (data.name) this.name = data.name
    if (data.maxMembers) this.maxMembers = data.maxMembers
    if (data.ping) this.ping = data.ping
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
        this.socket.emit("login", {
          bot: true, // what if i set to false :flushed:
          token: this.token
        })

        // result from authenticating
        this.socket.on("authResult", d => {
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
            this.client.emit("debug", `Server ${this.id} is ready!`)
            if (this.client.servers.cache.every(g => g.ready)) {
              this.client.emit("debug", `Connected to all guilds. The client is ready.`)
              this.client.emit("ready")
            }
            return d
          }).then(resolve).catch(reject)
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
    this.client.emit("debug", `Fetching data from server ${this.id}.`)
    let ping = Date.now()
    const data = {
      ...(await this.api.ping.get()), // ping the server, we gonna override some of its data anyway
      ping: Date.now() - ping,
      channels: await this.api.channels.get().then(d => d.channels),
      members: await this.api.members.get().then(d => d.members)
    }
    if (data.ip) delete data.ip
    
    this._patch(data)
    return this
  }
   
  load() {
    if (this.ready || !this.socket) return this
    
    this.client.emit("debug", `Loading events for server ${this.id}...`);
    this.socket
    .on("memberConnect", ({ member: data } = {}) => {
      this.client.emit("raw", data)
      this.memberCount++
      this.client.emit("memberJoin", this.members.add(data))
    })
    .on("memberDisconnect", ({ member: data } = {}) => {
      this.client.emit("raw", data)
      this.memberCount--
      this.client.emit("memberLeave", this.members.add(data, { cache: false }))
    })
    
    .on("msg", data => {
      this.client.emit("raw", data)
      if (data.server) return; // server message
      const channel = data.channel !== "DM" ? this.channels.add({ name: data.channel }) : this.members.add({ id: data.userID }).dm
      
      return this.client.emit("message", channel.messages.add(data))
    })
    
    // oh thats it?

    // these most likely wont happen but eh sure
    .on("disconnect", reason => {
      if (reason === "io server disconnect") {
        this.client.emit("debug", `Server ${this.id} asked us to disconnect.`)
        reason = "Reqeuested by the server"
      }
      this.client.emit("disconnect", reason)
    })

    .on("reconnect", (tries = 1) => this.client.emit("debug", `Sucessfully reconnected to server ${this.id} after ${tries} tries.`))
    .on("reconnect_attempt", n => !n ? this.client.emit("debug", `I am trying to reconnect to ${this.id} now...`) : null)
    return this
  }

  get host() {
    return `${this.ip}:${this.port}`
  }

  get secure() {
    return this.ip.startsWith("https")
  }

  get api() {
    return this.client.api.server(this)
  }

  get uptime() {
    return Date.now() - this.readyAt
  }
  
  toString() {
    return this.host
  }
}

module.exports = Server
