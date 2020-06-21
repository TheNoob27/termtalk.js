// totally not stolen from discord.js :sunglasses:
const other = [
  "toString",
  "valueOf",
  "constructor", 
  "inspect",
  Symbol.toPrimitive
],
methods = [
  "server", // set the server you want to make requests on
  "servers", // idk im lazy
  "get",
 // "put",
  "post",
 // "delete" // only 2 methods currently lol
]

const Server = require("../../structures/Server.js")

const blank = () => {}
module.exports = function createRoute(manager) {
  const route = [""]
  const handler = {
    get(_, name) {
      if (other.includes(name)) return () => route.join("/")
			
      if (methods.includes(name)) {
        if (name.includes("server")) return (server) => {
          if (server instanceof Server) route.server = server
          else if (typeof server === "string") {
            let s = manager.client.servers.cache.get(server.startsWith("http") ? server : `http://${server}`)
            if (s) route.server = s
          }
          return p(handler)
        }

        return (options) => manager.request({
          path: route.map(encodeURIComponent).join("/"),
          method: name.toUpperCase(),
          hostname: route.server ? route.server.name.slice(route.server.secure ? 8 : 7) || null : null,
          port: route.server ? route.server.port || 3000 : 3000,
          server: route.server
        }, options)
      }

      route.push(name)
      return p(handler)
    },
    apply(_t, _, args) {
      route.push(...args.filter((x) => x != null))
      return p(handler)
    }
  }
  return p(handler)
}

function p(h){
  return new Proxy(blank, h)
}

module.exports.p = p