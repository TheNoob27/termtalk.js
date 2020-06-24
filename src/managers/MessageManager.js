const BaseManager = require("./BaseManager.js")
const Message = require("../structures/Message.js")
const LC = require("../util/LimitedCollection.js")

class MessageManager extends BaseManager {
  constructor(channel) {
    super(channel.client, Message, null, LC, channel.client.options.messageCacheSize || 30)
    this.channel = channel
  }
  
  add(data, { id, cache } = {}) {
    return super.add(data, { id, cache, extras: [this.channel] })
  }
}

module.exports = MessageManager
