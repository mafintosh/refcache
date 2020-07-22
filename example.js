const Nanocache = require('./')

const n = new Nanocache({
  maxSize: 10,
  open (key) {
    console.log('opening', key)
    return key
  },
  close (key) {
    console.log('closing', key)
  }
})

const checkout = n.checkout(Buffer.from('hi'))

n.checkout(Buffer.from('foo'), { weak: true })
checkout.checkin()

let i = 0
n.checkout(Buffer.from('hi' + i++))
n.checkout(Buffer.from('hi' + i++))
n.checkout(Buffer.from('hi' + i++))
n.checkout(Buffer.from('hi' + i++))
n.checkout(Buffer.from('hi' + i++))
n.checkout(Buffer.from('hi' + i++))
n.checkout(Buffer.from('hi' + i++))
n.checkout(Buffer.from('hi' + i++))
n.checkout(Buffer.from('hi' + i++))
n.checkout(Buffer.from('hi' + i++))
n.checkout(Buffer.from('hi' + i++))
