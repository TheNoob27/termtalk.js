const Base = require("./Base.js")
const MemberManager = require("../managers/MemberManager.js")
const ChannelManager = require("../managers/ChannelManager.js")

class Server extends Base {
  constructor(client, data) {
    super(client)
    
    this.id = client.servers.cache.size
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
  
  fetch() {
    // gonna do client requests soon
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
