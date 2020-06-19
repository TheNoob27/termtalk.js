const BaseManager = require("./BaseManager.js")
const Channel = require("../structures/Channel.js")
const Message = require("../structures/Message.js")

class ChannelManager extends BaseManager {
  constructor(server) {
    super(server.client, Channel)
    
    this.server = server
  }
  
  add(data, { cache, id }) {
    return super.add(data, { cache, id, extras: [this.server] })
  }
  
  resolve(data) {
    if (data instanceof Message) return super.resolve(data.channel)
    return super.resolve(data)
  }
}

module.exports = ChannelManager
