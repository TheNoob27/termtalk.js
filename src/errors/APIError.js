class APIError extends Error {
  constructor(data = {}) {
    super(data.message)
    this.success = false
    this.code = data.code
    this.method = data.method
    this.type = data.type

    if (Error.captureStackTrace) Error.captureStackTrace(this, APIError)
  }

  get name() {
    return `${super.name} [${this.method} - ${this.type}]`
  }
}

module.exports = APIError