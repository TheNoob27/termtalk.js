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
  "put",
  "post",
  "delete" // and more i think lol
]

const blank = () => {}
module.exports = function createRoute(manager) {
  const route = [""]
  const handler = {
    get(_, name) {
      if (other.includes(name)) return () => route.join("/")
			
      if (methods.includes(name)) {
        if (name.includes("server")) return (server) => {
          route.server = server.startsWith("http") ? server : `http://${server}`)
          return p(handler)
        }

        return (options) => manager.request({
          path: route.join("/"),
          method: name.toUpperCase(),
          hostname: route.server ? route.server.slice(route.server.startsWith("https") ? 8 : 7) : null,
          port: route.server ? 
            route.server.includes(":") ? 
              route.server.split(":")[1] : 
              (manager.client.servers.cache.get(route.server) || {port: 3000}).port :
            3000
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

module.exports.p = function p(h){
  return new Proxy(blank, h)
}
