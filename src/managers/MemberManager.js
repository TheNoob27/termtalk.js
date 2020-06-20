const BaseManager = require("./BaseManager.js")
const Member = require("../structures/Member.js")

class MemberManager extends BaseManager {
  constructor(server) {
    super(server.client, Member)
    
    this.server = server
  }
  
  add(data, { cache, id } = {}) {
    return super.add(data, { cache, id, extras: [this.server] })
  }
  
  get guild() {
    return this.server
  }

  fetch() {
    return this.server.api.members.get()
  }
}

module.exports = MemberManager
