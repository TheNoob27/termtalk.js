const Requests = require("./requests/Requests.js")

class Client {
  constructor(options) {
    this.requests = new Requests(this)
    this.options = this.parseOptions(options)
  }
  
  get rest() {
    return this.requests
  }
  
  parseOptions(options) {
    const defaultOptions = {
      ip: "localhost", 
      port: 3000,
      token: null
    }
    
    if (!options || typeof options !== "object") return defaultOptions
    
    if ("ip" in options && typeof options.ip !== "string") throw new TypeError("The IP must be a string.")
    if ("port" in options && (typeof options.port !== "number" || isNaN(options.port)) throw new TypeError("The port must be a number.")
  }
}
