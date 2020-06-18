const Base = require("./Base.js")
const MemberManager = require("../managers/MemberManager.js")
const ChannelManager = require("../managers/ChannelManager.js")

class Server extends Base {
  constructor(client, data) {
    super(client)
    
    this.members = new MemberManager(this)
    this.channels = new ChannelManager(this)
    
    if (data) this._patch(data) // lol probably not gonna ever be any data
  }
  
  _patch(data) {
    if (data.token) Object.defineProperty(this, "token", { value: data.token, writable: true })
    
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
}
