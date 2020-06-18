const BaseManager = require("./BaseManager.js")
const Server = require("../structures/Server.js")

class ServerManager extends BaseManager {
  constructor(client) {
    super(client, Server)
  }
}

module.exports = ServerManager
