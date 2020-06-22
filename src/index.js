module.exports = {
  version: require("../package.json").version,
  
  Client: require("./client/Client.js"),
  
  Collection: require("./util/Collection.js"),
  LimitedCollection: require("./util/LimitedCollection.js"),
  
  Base: require("./structures/Base.js"),
  Channel: require("./structures/Channel.js"),
  Member: require("./structures/Member.js"),
  MessageMentions: require("./structures/MessageMentions.js"),
  Server: require("./structures/Server.js"),
  
  BaseManager: require("./managers/BaseManager.js"),
  ChannelManager: require("./managers/ChannelManager.js"),
  MemberManager: require("./managers/MemberManager.js"),
  MessageManager: require("./managers/MessageManager.js"),
  ServerManager: require("./managers/ServerManager.js"),
}
