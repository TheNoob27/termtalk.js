const EventEmitter = require("events")
const Collection = require("./Collection.js")

class MessageCollector extends EventEmitter {
  constructor(channel, filter, options) {
    Object.defineProperty(this, 'client', { value: channel.client })
    this.channel = channel
    
    if (typeof filter === "object" && filter) [filter, options] = [() => true, filter]
    this.filter = filter
    this.options = options
    
    this.messages = new Collection()
    this.count = 0
    this.ended = false
    
    if (this.client.getMaxListeners() !== 0) this.client.setMaxListeners(this.client.getMaxListeners() + 1)
    this.client.on("message", this.handleMessage)

    this.once("end", () => {
      this.client.removeListener("message", this.handleMessage)
      if (this.client.getMaxListeners() !== 0) this.client.setMaxListeners(this.client.getMaxListeners() - 1)
    })
    
    if (options.timeout || options.time) this._timeout = setTimeout(() => this.stop("time"), options.timeout || options.time)
  }
  
  handleMessage(m) {
    this.count++
    let passes = this._filter(m)
    if (passes && this.filter(m)) {
      this.messages.set(m.id, m)
      this.emit("message", m)
    }
    this.check()
    return m
  }
  
  check() {
    if (this.options.maxMessages && this.messages.size >= this.options.maxMessages) return this.stop("maxMessages")
    else if (this.options.max && this.count >= this.options.max) return this.stop("max")
  }
  
  _filter(m) {
    if (!m) return false
    if (!m.channel || m.channel.name !== this.channel.name) return false
    return true
  }
  
  stop(reason) {
    if (!this.ended) return;
    this.ended = true
    if (this._timeout) clearTimeout(this._timeout)
    return this.emit("end", reason, this.messages)
  }
}

module.exports = MessageCollector
