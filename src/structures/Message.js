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
    this.content = data.msg || ""
    
    if (data.userID) {
      this.member = this.server.members.add({
        username: data.username, 
        tag: data.tag, 
        uid: data.uid, 
        id: data.userID 
      })
      this.author = this.member.user
    }
    
    this.system = Boolean(data.server)
    
    if (this.content) {
      this.mentions.parse()
    }
  }
  
  
  reply(msg = "") {
    if (typeof msg !== "string") return Promise.reject(new Error("MESSAGE_TYPE"))
    msg = `${this.author || "@User#0000"}${msg && ", "}${msg}`
    
    return this
      .server.api
      .channels(this.channel.id)
      .messages
      .post({
        ...(this.server.me ? this.server.me.user.json : this.client.user.json),
        msg
      })
      .then(message => this.channel.messages.add(message))
  }
}

module.exports = Message
