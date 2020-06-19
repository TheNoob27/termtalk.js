const Base = require("./Base.js")
const MemberManager = require("../managers/MemberManager.js")
const ChannelManager = require("../managers/ChannelManager.js")
const io = require("socket.io-client") // uh
const { Error } = require("../errors")

class Server extends Base {
  constructor(client, data) {
    super(client)
    
    this.id = client.servers.cache.size
    this.readyAt = null
    this.socket = null
    
    this.members = new MemberManager(this)
    this.channels = new ChannelManager(this)
    
    if (data) this._patch(data)
  }
  
  _patch(data) {
    if (data.token) Object.defineProperty(this, "token", { value: data.token, writable: true })
    if (typeof data.ip === "string") this.ip = data.ip.startsWith("http") ? data.ip : `http://${data.ip}`
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
  
  login(deleteReject = false) {
    const connect = new Promise((resolve, reject) => {
      const socket = io(this.host, {
        reconnectionAttempts: 10,
        timeout: 30000
      })
      
      const clean = (fn, a) => {
        socket.removeAllListeners()
        return fn(a)
      }
      
      socket.once("connect", () => {
        socket.once("methodResult", data => {
          return data.success ? clean(resolve, data) : clean(reject, data)
        })
      })
      
      socket.on("reconnect_failed", () => {
        return clean(reject, new Error("CONNECTION_FAILED"))
      })
    })
    
    return connect.then(s => {
      this.socket = s
      
      return new Promise((resolve, reject) => { // only using promises to reject/resolve 
        // login to the server
        this.socket.emit("login", {
          bot: true, // what if i set to false :flushed:
          token: this.token
        })
      
        // authenticate
        this.socket.once("authResult", async d => {
          if (!d.success) {
            this.socket.close(true)
            return reject(d)
          }
        
          const member = this.members.add(d.bot)
          await this.fetch().then(resolve).catch(reject)
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
  
  async fetch() {
    const data = {
      channels: await this.api.channels.get(),
      members: await this.api.members.get()
    }
    
    return this._patch(data)
  }

  get host() {
    return `${this.ip}:${this.port}`
  }

  get secure() {
    return this.ip.startsWith("https")
  }
  
  get name() {
    return this.ip || ""
  }

  get api() {
    return this.client.api.server(this)
  }
}

module.exports = Server
