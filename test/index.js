const { Client } = require("../src")

const client = new Client({
  ip: "localhost", //"https://hub.termtalk.app",
  port: 5000, //3000,
  token: require("./token")[0]
})


client.on("debug", console.log);
client.on("ready", console.log.bind("I am ready!"));

(async () => {
  /*
  const { token } = await client.create({
    id: "TestBot2ElectricBungaloo",
    ownerID: "TheNoob27",
    username: "TermTalk.js",
    tag: "1273",
    ownerPassword: "",
  });
  ---
  const { token } = await client.create({
    username: "TermTalk.js",
    id: "TermTalk.js",
    tag: "1273",
    ownerID: "TheNoob27",
    ownerPassword: "",
    ip: "https://terminals.rest",
    port: 7500
  }, true)
  */

  await client.login() // or client.login(token (server.token))
  .then(server => {
    // server.channels.cache.first().send("Hello, i'm a bot")
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
  })
})()
