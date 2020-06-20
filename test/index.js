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
  const token = "MTU5MjYyMTE1MjkyNg==.MTM0NTAwOTY2MTYxNDg5OTI=.$2b$20$VPA3P.QY1DUduwazKaHFke"
  console.log(token)

  await client.login(token) // or client.login(token (server.token))
  .then(server => {
    console.log(server)
    server.channels.cache.first().send("Hello, i'm a bot")
    client.on("message", message => {
      if (message.author.username === "TheNoob27" && message.content.startsWith("eval ")) {
        const { inspect } = require("util")
        const toEval = args.split(/ +/).slice(1)
        let res;
        try {
          res = inspect(eval(toEval), { depth: 0 })
        } catch (e) {
          res = e.message
        }
        message.reply(res).catch(e => message.reply("Output was probably too long."))
      }
    })
  })
})()
