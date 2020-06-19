const Base = require("./Base.js")
const { Error } = require("../errors")
const Collection = require("../util/Collection.js")

class Message extends Base {
  constructor(client, data, channel) {
    super(client)
    
    this.channel = channel
    this.mentions = new Collection()
    if (data) this._patch(data)
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
      const mentionRegex = /@[^\s].+?#\d{4}/gi // /<@\d{10,20}>/ // can discrims have letters?
      const matches = this.content.match(mentionRegex)
      
      if (matches) {
        this.mentions.clear()
        for (const ping of matches) {
          const [username, discrim] = ping.substring(1).split("#")
          if (!(username && discrim)) continue;
          const user = this.server.members.find(m => m.user && m.user.username === username && m.user.discriminator === discrim)
          if (user) this.mentions.set(user.id, user)
        }
      }
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

module.exports = Channel
