const ErrorMessages = {
  OPTIONS_INVALID: "An invalid options object was provided."
}

function TermTalkError(E, _) {
  return class TermTalkError extends E {
    constructor(m = _) {
      super(ErrorMessages[m] || m)
      this.name = E && E.name || "TermTalkError"
      
      if (Error.captureStackTrace) Error.captureStackTrace(this, TermTalkError);
    }
  }
}

module.exports = {
  create: TermTalkError,
  TypeError: TermTalkError(TypeError),
  RangeError: TermTalkError(RangeError),
  Error: TermTalkError(),
  messages: ErrorMessages
}
