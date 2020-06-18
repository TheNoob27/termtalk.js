const BaseManager = require("./BaseManager.js")
const Member = require("../structures/Member.js")

class MemberManager extends BaseManager {
  constructor(server) {
    super(server.client, Member)
    
    this.server = server
  }
  
  get guild() {
    return this.server
  }
}

module.exports = MemberManager
