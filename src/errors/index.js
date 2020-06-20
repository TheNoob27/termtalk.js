const ErrorMessages = {
  BOT_CREATE_INFO: "Not enough information was provided to create a bot. Please remember to provide ownerID, and ownerPassword",
  BOT_CREATE_TYPE: "Some of the provided information is of the wrong type.",
  INVALID_TOKEN: "An invalid token was provided.",
  OPTIONS_INVALID: "Invalid options were provided.",
  OPTIONS_LENGTH: "Please provide an equal amount of IPs and Ports.",

  MESSAGE_TYPE: "The message must be a string.",
  USER_DM: "Cannot send DMs to this user.",
  CONNECTION_FAILED: "Failed to establish a connection to the server."
}

function Make(E = Error, _) {
  return class TermTalkError extends E {
    constructor(m = _) {
      super(ErrorMessages[m] || m)
      this.name = E && E.name || "TermTalkError"
      
      if (Error.captureStackTrace) Error.captureStackTrace(this, TermTalkError);
    }
  }
}

module.exports = {
  create: Make,
  TypeError: Make(TypeError),
  RangeError: Make(RangeError),
  Error: Make(),
  APIError: require("./APIError.js"),
  messages: ErrorMessages
}
