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
    console.log(this.channel.server)
    console.log(Member)
    return this.channel.server instanceof Member ? this.channel.server.server : this.channel.server
  }
  
  _patch(data) {
    if (data.id) this.id = data.id
    this.content = data.msg || ""
    
    if (data.userID) {
      this.author = this.server.members.add({
        username: data.username, 
        tag: data.tag, 
        uid: data.uid, 
        id: data.userID 
      })
    }
    
    // ik i ignore server messages but eh
    this.system = Boolean(data.server)
    
    if (this.content) {
      this.mentions.parse()
    }
  }
  
  
  reply(msg = "") {
    if (typeof msg !== "string") return Promise.reject(new Error("MESSAGE_TYPE"))
    msg = `${this.author || "@User#0000"}${msg && ", "}${msg}`
    
    return this.channel.send(msg)
  }
}

module.exports = Message
const Member = require("./Member.js")
console.log(Member, require("./Member.js"), require("./Channel"), MessageMentions)
