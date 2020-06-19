const Base = require("./Base.js")
const User = require("./User.js")

class Member extends Base {
  constructor(client, data, server) {
    super(client)
    this.server = server
    
    if (data) this._patch(data)
  }
  
  _patch(data) {
    this.admin = Boolean(data.admin)
    this.user = this.client.users.add(data)
    // members are bare aside user data
  }
  
  send(msg) {
    if (typeof msg !== "string") return Promise.reject(new Error("MESSAGE_TYPE"))
    
    return this
      .server.api
      .members(this.id)
      .messages
      .post({
        ...(this.server.clientMember ? this.server.clientMember.user.json : this.client.user.json),
        msg
      })
  }
}

module.exports = Member
