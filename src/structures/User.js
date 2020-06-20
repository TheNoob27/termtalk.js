const Base = require("./Base.js")
const { Error } = require("../errors")

class User extends Base {
  constructor(client, data) {
    super(client)
    if (data) this._patch(data)
  }
  
  _patch(data) {
    if (data.id) this.id = data.id
    
    if (data.uid) this.uid = data.uid
    if (data.username) this.username = data.username
    if (data.tag) this.discriminator = data.tag
    if (data.bot) this.bot = Boolean(data.bot)
    
    if (data.sessionID) this.sessionID = data.sessionID
  }
  
  get tag() {
    return typeof this.username === 'string' ? `${this.username}#${this.discriminator}` : null
  }
  
  send(msg) {
    let server = this.client.servers.cache.find(s => s.members.cache.has(this.id))
    if (!server) return Promise.reject(new Error("USER_DM"))
    if (typeof msg !== "string") return Promise.reject(new Error("MESSAGE_TYPE"))
    
    return server.api
      .members(this.id)
      .messages
      .post({ 
        ...(server.me ? server.me.user.json : this.client.user.json), 
        msg 
      })
  }
  
  get json() {
    // hard-coded because lazy
    return {
      username: this.username,
      tag: this.discriminator,
      uid: this.uid,
      id: this.id,
      ...(this.sessionID ? { sessionID: this.sessionID } : {})
    };
  }
  
  mutualServers() {
    return this.client.servers.cache.filter(s => s.members.cache.has(this.id))
  }

  toString() {
    return `@${this.tag}`
  }
}

module.exports = User
