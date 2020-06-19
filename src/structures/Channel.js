const Base = require("./Base.js")
const Messages = require("../managers/MessageManager.js")
const { Error } = require("../errors")

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
  
  send(msg) {
    if (typeof msg !== "string") return Promise.reject(new Error("MESSAGE_TYPE"))
    
    return this
      .server.api
      .channels(this.id)
      .messages
      .post({
        ...this.client.user.json,
        msg
      })
      .then(message => this.messages.add(message, { extras: [this] }))
  }
}

module.exports = Channel
