const BaseManager = require("./BaseManager.js")
const Message = require("../structures/Message.js")

class MessageManager extends BaseManager {
  constructor(channel) {
    super(channel.client, Message)
    
    this.channel = channel
  }
  
  add(data, { id, cache }) {
    return super.add(data, { id, cache, extras: [this.channel] })
  }
}

module.exports = MessageManager
