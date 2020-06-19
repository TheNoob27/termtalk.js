const BaseManager = require("./BaseManager.js")
const User = require("../structures/User.js")

class UserManager extends BaseManager {
  constructor(client) {
    super(client, User)
  }
}

module.exports = UserManager
