const tape = require('tape')
const Refcache = require('./')

tape('basic', function (t) {
  t.plan(3)

  let opened = 0
  let closed = 0

  const rc = new Refcache({
    maxSize: 2,
    open () {
      return opened++
    },
    close (id) {
      t.same(id, 1)
      closed++
    }
  })

  const a = rc.checkout('a')
  const b = rc.checkout('b')
  const c = rc.checkout('c')

  b.checkin()
  a.checkin()
  c.checkin()

  t.same(opened, 3)
  t.same(closed, 1)
})

tape('force remove', function (t) {
  t.plan(2)

  let opened = 0
  let closed = 0

  const rc = new Refcache({
    maxSize: 2,
    open () {
      return opened++
    },
    close () {
      closed++
    }
  })

  const a = rc.checkout('a')
  const b = rc.checkout('b')
  const c = rc.checkout('c')

  b.remove()
  a.remove()
  c.remove()

  t.same(opened, 3)
  t.same(closed, 3)
})

tape('gc weak refs', function (t) {
  t.plan(4)

  let opened = 0
  let closed = 0

  const rc = new Refcache({
    maxSize: 2,
    open () {
      return opened++
    },
    close () {
      closed++
    }
  })

  rc.checkout('a')
  rc.checkout('b', { weak: true })
  rc.checkout('c', { weak: true })

  t.same(opened, 3)
  t.same(closed, 1)

  rc.checkout('d')

  t.same(opened, 4)
  t.same(closed, 2)
})

tape('multi lookup on same key', function (t) {
  let opened = 0
  let closed = 0

  const rc = new Refcache({
    maxSize: 2,
    open () {
      return opened++
    },
    close () {
      closed++
    }
  })

  const a = rc.checkout('a')
  const b = rc.checkout('a', { weak: true })
  rc.checkout('a', { weak: true })

  t.same(opened, 1)
  t.same(closed, 0)

  rc.checkout('b')
  rc.checkout('c')

  t.same(opened, 3)
  t.same(closed, 0)

  b.checkin()

  t.same(opened, 3)
  t.same(closed, 0)

  a.checkin()

  t.same(opened, 3)
  t.same(closed, 1)
  t.same(b.closed, true)

  t.end()
})
