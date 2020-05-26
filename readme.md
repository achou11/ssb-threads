# ssb-threads

> A Scuttlebot plugin for fetching messages as threads

## Usage

**Requires the backlinks plugin.** If the **ssb-friends** plugin is available it will filter the messages of blocked users.

```diff
 SecretStack({appKey: require('ssb-caps').shs})
   .use(require('ssb-master'))
   .use(require('ssb-db'))
   .use(require('ssb-replicate'))
   .use(require('ssb-lan'))
   .use(require('ssb-conn'))
+  .use(require('ssb-backlinks'))
   .use(require('ssb-friends'))
   .use(require('ssb-private'))
+  .use(require('ssb-threads'))
   .use(require('ssb-blobs'))
   .use(require('ssb-invite'))
   .call(null, config)
```

```js
pull(
  ssb.threads.public({
    limit: 10, // how many threads at most
    reverse: true, // threads sorted from most recent to least recent
    threadMaxSize: 3, // at most 3 messages in each thread
  }),
  pull.drain(thread => {
    console.log(thread);
    // the `thread` is an object of shape `{ messages, full }` where `messages`
    // is an array of SSB messages, and `full` is a boolean indicating whether
    // `messages` array contains all replies to the thread. Any message that has
    // its `root` field or `branch` field or `fork` field pointing to the root
    // of the thread can be included in this array, but sometimes we may omit a
    // message if the `threadMaxSize` has been reached, in which case the
    // `messages` array will have `length` equal to `threadMaxSize`.
  }),
);
```

## API

### `ssb.threads.public(opts)`

Returns a pull stream that emits thread objects of public messages.

* `opts.reverse`: boolean
* `opts.limit`: optional number (default: Infinity). Dictates the maximum amount of
  threads this pull stream will return
* `opts.threadMaxSize`: optional number (default: Infinity). Dictates the maximum amount of messages in each returned thread object. Serves for previewing threads, particularly long ones.
* `opts.allowlist`: optional array of strings. Dictates which messages **types** to allow as root messages, while forbidding other types.
* `opts.blocklist`: optional array of strings. Dictates which messages **types** to forbid as root messages, while allowing other types.

### `ssb.threads.publicUpdates(opts)`

Returns a ("live") pull stream that emits a message key (strings) for every new message that passes the (optional) allowlist or blocklist.

* `opts.includeSelf`: optional boolean that indicates if updates from yourself (the current `ssb.id`) should be included in this stream or not.
* `opts.allowlist`: optional array of strings. Dictates which messages **types** to allow as root messages, while forbidding other types.
* `opts.blocklist`: optional array of strings. Dictates which messages **types** to forbid as root messages, while allowing other types.

### `ssb.threads.private(opts)`

**Requires the **ssb-private** plugin to be installed.**

Returns a pull stream that emits thread objects of private conversations.

* `opts.reverse`: boolean
* `opts.limit`: optional number (default: Infinity). Dictates the maximum amount of
  threads this pull stream will return
* `opts.threadMaxSize`: optional number (default: Infinity). Dictates the maximum amount of messages in each returned thread object. Serves for previewing threads, particularly long ones.
* `opts.allowlist`: optional array of strings. Dictates which messages **types** to allow as root messages, while forbidding other types.
* `opts.blocklist`: optional array of strings. Dictates which messages **types** to forbid as root messages, while allowing other types.

### `ssb.threads.privateUpdates(opts)`

Returns a ("live") pull stream that emits the message key (string) for thread roots every time there is a new reply or root, and that passes the (optional) allowlist or blocklist.

* `opts.includeSelf`: optional boolean that indicates if updates from yourself (the current `ssb.id`) should be included in this stream or not.
* `opts.allowlist`: optional array of strings. Dictates which messages **types** to allow as root messages, while forbidding other types.
* `opts.blocklist`: optional array of strings. Dictates which messages **types** to forbid as root messages, while allowing other types.

### `ssb.threads.profile(opts)`

Returns a pull stream that emits thread objects of public messages initiated by a certain profile `id`.

* `opts.id`: FeedId of some SSB user.
* `opts.reverse`: boolean.
* `opts.limit`: optional number (default: Infinity). Dictates the maximum amount of
  threads this pull stream will return
* `opts.threadMaxSize`: optional number (default: Infinity). Dictates the maximum amount of messages in each returned thread object. Serves for previewing threads, particularly long ones.
* `opts.allowlist`: optional array of strings. Dictates which messages **types** to allow as root messages, while forbidding other types.
* `opts.blocklist`: optional array of strings. Dictates which messages **types** to forbid as root messages, while allowing other types.

### `ssb.threads.thread(opts)`

Returns a pull stream that emits one thread object of messages under the root identified by `opts.root` (MsgId).

* `opts.root`: a MsgId that identifies the root of the thread.
* `opts.private`: optional boolean indicating that (when `true`) you want to get only private messages, or (when `false`) only public messages; **⚠️ Warning: you should only use this locally, do not allow remote peers to call `ssb.threads.thread`, you don't want them to see your encrypted messages.**
* `opts.threadMaxSize`: optional number (default: Infinity). Dictates the maximum amount of messages in each returned thread object. Serves for previewing threads, particularly long ones.
* `opts.allowlist`: optional array of strings. Dictates which messages **types** to allow as root messages, while forbidding other types.
* `opts.blocklist`: optional array of strings. Dictates which messages **types** to forbid as root messages, while allowing other types.

If `opts.allowlist` and `opts.blocklist` are not defined,
only messages of type **post** will be returned.

### `ssb.threads.threadUpdates(opts)`

Returns a ("live") pull stream that emits every new message which is a reply to this thread, and which passes the (optional) allowlist or blocklist.

* `opts.root`: a MesgId that identifies the root of the thread.
* `opts.private`: optional boolean indicating that (when `true`) you want to get only private messages, or (when `false`) only public messages; **⚠️ Warning: you should only use this locally, do not allow remote peers to call `ssb.threads.thread`, you don't want them to see your encrypted messages.**
* `opts.allowlist`: optional array of strings. Dictates which messages **types** to allow as root messages, while forbidding other types.
* `opts.blocklist`: optional array of strings. Dictates which messages **types** to forbid as root messages, while allowing other types.

## Install

```
npm install --save ssb-threads
```

## License

MIT
