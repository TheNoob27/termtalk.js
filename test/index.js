const { Client } = require("../src")

const client = new Client({
  ip: "https://hub.termtalk.app",
  port: 3000
})

client.on("debug", console.log);

(async () => {
  /*
  const { token } = await client.create({
    id: "TestBot2ElectricBungaloo",
    ownerID: "TheNoob27",
    username: "TermTalk.js",
    tag: "1273",
    ownerPassword: "thenoob27",
  });
  */
  const token = require("./token.js") // pretend this is env lol
  console.log(token)

  await client.login(token) // or client.login(token (server.token))
  .then(server => {
    console.log(server)
    // server.channels.cache.first().send("Hello, i'm a bot")
    client.on("message", message => {
      console.log(message.content, message.content.length)
      if (message.author.username !== "TheNoob27") return;

      if (message.content.toLowerCase().startsWith("eval ")) {
        const { inspect } = require("util")
        const toEval = args.split(/ +/).slice(1)
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
  })
})()
