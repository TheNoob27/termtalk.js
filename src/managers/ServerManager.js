const BaseManager = require("./BaseManager.js")
const Server = require("../structures/Server.js")

class ServerManager extends BaseManager {
  constructor(client, servers) {
    super(client, Server, servers);
  }

  add(data = {}, { id, cache = true, extras = [] } = {}) {
    const exists = this.cache.find(
      (s) =>
        (s.token && s.token === data.token) ||
        s.name.replace(/https?:\/\//, "") === (data.ip || "").replace(/https?:\/\//, "")
    )
    console.log("exists servermansge:", !!exists)
    if (exists) console.log(exists)

    if (exists && exists._patch && cache) exists._patch(data);
    if (exists) return exists;

    const entry = this.dataType
      ? new this.dataType(this.client, data, ...extras)
      : data;
    if (cache) this.cache.set(id || entry.id, entry);
    return entry;
  }

  get connect() {
    return this.client.login;
  }
}

module.exports = ServerManager
