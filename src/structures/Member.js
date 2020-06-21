const Base = require("./Base.js")

class Member extends Base {
  constructor(client, data, server) {
    super(client)
    this.server = server
    
    if (data) this._patch(data)
  }
  
  _patch(data) {
    if (data.id) this.id = data.id

    if (data.uid) this.uid = data.uid
    if (data.username) this.username = data.username
    if (data.tag) this.discriminator = data.tag
    this.bot = Boolean(data.bot)

    if (data.sessionID) this.sessionID = data.sessionID
    this.admin = Boolean(data.admin)
  }
  
  send(msg) {
    if (typeof msg !== "string") return Promise.reject(new Error("MESSAGE_TYPE"))
    if (!this.server.me) return Promise.reject(new Error("USER_DM"))

    return this
      .server.api
      .members(this.id)
      .messages
      .post({
        ...((this.server.me || this.client.user || {}).json),
        msg
      }).then(() => this)
  }

  get tag() {
    return typeof this.username === 'string' ? `${this.username}#${this.discriminator}` : null
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

module.exports = Member
