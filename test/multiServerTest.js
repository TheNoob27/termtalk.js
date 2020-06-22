const { Client } = require("../src")

const client = new Client({
  ip: ["https://terminals.rest", "https://hub.termtalk.app"],
  port: [7500, 3000]
});

process.on("unhandledRejection", console.error)
client.on("debug", console.log).on("ready", () => console.log("I am ready!!!!!!!! Connected to " + client.servers.cache.size + " servers!!!!!"))
;
(async () => {
  const tokens = require("./token")
  const { token: token2 } = await client.create({
    username: "TermTalk.js",
    id: "TermTalk.js",
    tag: "1273",
    ownerID: "TheNoob27",
    ownerPassword: "thenoob27"
  }, true)
  console.log(token2)
  await client.login(tokens[0])

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