const BaseManager = require("./BaseManager.js")
const Server = require("../structures/Server.js")

class ServerManager extends BaseManager {
  constructor(client, servers) {
    super(client, Server, servers)
  }

  connect({ ip, port }) {
    //
  }
}

module.exports = ServerManager
