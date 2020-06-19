const Base = require("./Base.js")
const { Error } = require("../errors")

class Message extends Base {
  constructor(client, data, channel) {
    super(client)
    
    this.channel = channel
    if (data) this._patch(data)
  }
  
  _patch(data) {
    this.name = data.name || "General"
  }
  
  reply(msg = "") {
    if (typeof msg !== "string") return Promise.reject(new Error("MESSAGE_TYPE"))
    ``
    return this
      .server.api
      .channels(this.id)
      .messages
      .post({
        ...this.client.user.json,
        msg
      })
      .then(message => this.messages.add(message))
  }
}

module.exports = Channel
