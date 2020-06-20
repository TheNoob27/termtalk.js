const Base = require("./Base.js")
const { Error } = require("../errors")
const MessageMentions = require("./MessageMentions.js")

class Message extends Base {
  constructor(client, data, channel) {
    super(client)
    
    this.channel = channel
    this.mentions = new MessageMentions(this)
    if (data) this._patch(data)
  }
  
  get server() {
    return this.channel.server
  }
  
  _patch(data) {
    if (data.id) this.id = data.id
    this.content = data.content || ""
    
    if (data.userID) this.author = this.server.members.add({
      username: data.username, 
      tag: data.tag, 
      uid: data.uid, 
      id: data.userID 
    })
    
    if (this.content) {
      this.mentions.parse()
    }
  }
  
  get user() {
    return this.author && this.author.user
  }
  
  get member() {
    return this.author
  }
  
  reply(msg = "") {
    if (typeof msg !== "string") return Promise.reject(new Error("MESSAGE_TYPE"))
    msg = `${this.user ? this.user.discriminator : "@User#0000"}${msg && ", "}${msg}`
    
    return this
      .server.api
      .channels(this.channel.id)
      .messages
      .post({
        ...this.client.user.json,
        msg
      })
      .then(message => this.channel.messages.add(message))
  }
}

module.exports = Message
