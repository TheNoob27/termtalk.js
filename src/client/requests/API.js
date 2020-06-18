// totally not stolen from discord.js :sunglasses:
const other = [
	"toString",
	"valueOf",
	"constructor", 
	"inspect",
	Symbol.toPrimitive
],
methods = [
	"get",
	"create",
	"post",
	"delete" // and more i think lol
]

const blank = () => {}
module.exports = function createRoute(requests) {
  const route = [""]
  const handler = {
    get(_, name) {
			if (other.includes(name)) return () => route.join("/")
			
      if (methods.includes(name)) return (options) => requests.request(name, route.join("/"), options)
			
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
