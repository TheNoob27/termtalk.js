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

  fetch() {
    return this.server.api.members.get().then(({ members: data }) => {
      this.server._patch({ data })
      return this.server.members.cache
    })
  }
}

module.exports = MemberManager
