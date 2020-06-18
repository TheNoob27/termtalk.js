const createRoute = require("./API.js")

class Requests {
  constructor(client) {
    this.client = client
  }
  
  get api() {
    return createRoute(this)
  }
}

module.exports = Requests
