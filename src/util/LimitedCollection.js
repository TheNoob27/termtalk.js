const Collection = require("./Collection.js")

class LimitedCollection extends Collection {
  constructor(size = 0, iterable = null) {
    super(iterable)
    
    this.maxSize = size;
  }

  set(key, value) {
    if (this.maxSize === 0) return this;
    if (this.size >= this.maxSize && !this.has(key)) this.delete(this.firstKey());
    return super.set(key, value);
  }

  static get [Symbol.species]() {
    return Collection;
  }
}

module.exports = LimitedCollection;
