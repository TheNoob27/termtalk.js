const Collection = require("../util/Collection")

class MessageMentions {
  constructor(message) {
    this.message = message
    this.users = new Collection()
    this.channels = new Collection()
    //if (this.message.content) this.parse()
  }

  parse() {
    this.users.clear()
    this.channels.clear()

    let matches = this.message.content.match(/@[^\s].+?#\d{4}/gi) // /<@\d{10,20}>/gi // can discrims have letters?

    if (matches) {
      for (const ping of matches) {
        const [username, discrim] = ping.substring(1).split("#")
        if (!(username && discrim)) continue;
        const user = this.message.server.members.find(m => m.user && m.user.username === username && m.user.discriminator === discrim)
        if (user) this.users.set(user.id, user)
      }
    }

    matches = this.message.content.match(/#[^\s]+/gi)

    if (matches) {
      for (const channel of matches) {
        channel = channel.substring(1)
        channel = this.message.server.channels.find(c => c.name === channel)
        if (channel) this.channels.set(channel.name, channel) 
      }
    }

    return this
  }
}

module.exports = MessageMentions
