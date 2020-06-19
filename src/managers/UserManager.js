const BaseManager = require("./BaseManager.js")
const User = require("../structures/User.js")

class UserManager extends BaseManager {
  constructor(server) {
    super(client, User)
  }
}

module.exports = ChannelManager
