const Base = require("./Base.js")
const Messages = require("../managers/MessageManager.js")
const Member = require("./Member.js")
const { Error } = require("../errors")
const MessageCollector = require("../util/MessageCollector.js")

class Channel extends Base {
  constructor(client, data, server) {
    super(client)
    
    this.server = server
    this.messages = new Messages(this)
    if (data) this._patch(data)
  }
  
  _patch(data) {
    this.name = data.name || "General"
  }

  get id() {
    return this.name
  }
  
  send(msg) {
    if (this.server instanceof Member) return this.server.send(msg) // dm
    if (typeof msg !== "string") return Promise.reject(new Error("MESSAGE_TYPE"))
    
    return this
      .server.api
      .channels(this.id)
      .messages
      .post({
        ...((this.server.me || this.client.user).json),
        msg
      })
      .then(({ message }) => this.messages.add(message))
  }
  
  createMessageCollector(filter, options) {
    return new MessageCollector(this, filter, options)
  }
  
  awaitMessages(filter, options = {}) {
    return new Promise((resolve, reject) => {
      this.createMessageCollector(filter, options)
      .once("end", (reason, msgs) => options && options.errors && options.errors.includes(reason) ? reject(msgs) : resolve(msgs))
    })
  }
}

module.exports = Channel
