const TOS = require('time-ordered-set')

class Entry {
  constructor (id, val) {
    this.id = id
    this.value = val
    this.refs = 0
    this.closed = false
    this.next = null
    this.prev = null
  }
}

class Checkout {
  constructor (cache, entry, external) {
    this.entry = entry
    this.value = entry.value
    this.cache = cache
    this.external = external
  }

  get closed () {
    return this.entry.closed
  }

  bump () {
    if (this.entry.refs > 0) return
    this.cache.gcable.add(this.entry)
  }

  remove () {
    if (!this.cache.opened.has(this.entry.id)) return
    this.cache.gcable.remove(this.entry)
    this.cache.opened.delete(this.id)
    this.entry.closed = true
    this.cache.close(this.entry.value)
  }

  checkin () {
    if (this.external) {
      if (!--this.entry.refs) {
        this.cache.gcable.add(this.entry)
        this.cache.gc(false)
      }
    }
  }
}

module.exports = class Refcache {
  constructor ({ maxSize = 0, open, close }) {
    this.maxSize = maxSize
    this.open = open
    this.close = close
    this.opened = new Map()
    this.gcable = new TOS()
  }

  gc (force = false) {
    if (!this.gcable.length) return
    if (!force && this.opened.size <= this.maxSize) return
    const oldest = this.gcable.remove(this.gcable.oldest)
    this.opened.delete(oldest.id)
    oldest.closed = true
    this.close(oldest.value)
  }

  checkout (key, opts = {}) {
    const id = key.toString('hex')
    const external = !opts.weak

    let entry = this.opened.get(id)
    if (!entry) {
      entry = new Entry(id, this.open(key, opts))
      this.opened.set(id, entry)
      this.gc(false)
    }

    if (external) entry.refs++

    if (entry.refs === 0) {
      this.gcable.add(entry)
    }

    return new Checkout(this, entry, external)
  }
}
