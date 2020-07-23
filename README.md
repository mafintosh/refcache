# refcache

Small cache abstraction that auto GCs unref'ed objects after a max size has
been reached.

```
npm install refcache
```

## Usage

``` js
const Refcache = require('refcache')

const cache = new Refcache({
  maxSize: 1000, // set the max cache of unreffed objects
  open (key, opts) {
    // return the thing you wanna cache
  },
  close (thing) {
    // close the thing you opened
  }
})

const checkout = cache.checkout(Buffer.from('some-key'), {
  ...someOptions
})

// use checkout.value ...
// then let the cache know you are done with it
checkout.checkin()
```

## API

#### `cache = new Refcache(options)`

Make a new cache instance. Options include:

```js
{
  maxSize, // how many unreffed objects to cache
  open(key, opts), // make a new instance to cache
  close(instance) // close a cached instance
}
```

#### `checkout = cache.checkout(key, [options])`

Checkout a value from the cache. If not present it is auto opened.
Every checkout you do is reference counted, and only cached values
with no references are closed after the max size is reached.

If you do not want to ref count this particular checkout pass `{ weak: true }`
to the options. All options are forwarded to open.

#### `bool = cache.has(key)`

Check if the cache has a specific key loaded.

#### `checkout.checkin()`

Call this when you are done with the value.
You may only call this once.

#### `checkout.closed`

Whether or not this entry has been closed.

#### `checkout.value`

The value returned from open.

#### `checkout.remove()`

Force remove this value from the cache.

#### `checkout.bump()`

Bumps this value in the internal LRU.

## License

MIT
