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
module.exports = function createRoute(requests) {
  const route = [""]
  const handler = {
    get(_, name) {
      if (other.includes(name)) return () => route.join("/")
			
      if (methods.includes(name)) {
        if (name.includes("server")) return (server) => {
          route.unshift(server.startsWith("http") ? server : `http://${server}`)
          return p(handler)
        }

        return (options) => requests.request(
          name, route.join("/"), Object.assign(options, {
            server: route[0].includes("http") ? route[0] : null
          })
        )
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
