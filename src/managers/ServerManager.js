const BaseManager = require("./BaseManager.js")
const Server = require("../structures/Server.js")

class ServerManager extends BaseManager {
  constructor(client, servers) {
    super(client, Server, servers)
  }

  get connect() {
    return this.client.login
  }
}

module.exports = ServerManager
