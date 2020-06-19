const createRoute = require("./API.js")

class RequestsManager {
  constructor(client) {
    this.client = client
  }

  get api() {
    return createRoute(this)
  }

  get make() {
    return this.request
  }

  request(method, route, options) {
    method = method.toUpperCase()
    
  }
}

module.exports = RequestsManager
