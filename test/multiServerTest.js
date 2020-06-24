const { Client } = require("../src")

const client = new Client({
  ip: ["localhost", "https://hub.termtalk.app"],
  port: [5000, 3000],
  token: require("./token")
});

process.on("unhandledRejection", console.error)
client.on("debug", console.log).on("ready", () => console.log("I am ready!!!!!!!! Connected to " + client.servers.cache.size + " servers!!!!!"))
;
(async () => {
  await client.login()

  client.on("message", message => {
    console.log(message)

    if (!message.author || message.author.username !== "TheNoob27") return;

    if (message.content.toLowerCase().startsWith("eval ")) {
      const { inspect } = require("util")
      const toEval = message.content.slice(5)
      let res;
      try {
        res = inspect(eval(toEval), { depth: 0 })
      } catch (e) {
        res = e.message
      }
      message.reply(res).catch(e => message.reply("Output was probably too long."))
    } else if (message.content.toLowerCase().startsWith("say ")) {
      message.reply(message.content.slice(4))
    }
  })
})()