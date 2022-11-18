const test = require('tape');
const pull = require('pull-stream');
const ssbKeys = require('ssb-keys');
const pullAsync = require('pull-async');
const Testbot = require('./testbot');
const wait = require('./wait');

const lucyKeys = ssbKeys.generate(null, 'lucy');

test('threads.hashtagSummary understands msg.value.content.channel', (t) => {
  const ssb = Testbot({ keys: lucyKeys });

  pull(
    pullAsync((cb) => {
      ssb.db.create(
        {
          keys: lucyKeys,
          content: { type: 'post', text: 'Pizza', channel: 'food' },
        },
        wait(cb, 100),
      );
    }),
    pull.asyncMap((rootMsg, cb) => {
      ssb.db.create(
        {
          keys: lucyKeys,
          content: { type: 'post', text: 'pepperoni', root: rootMsg.key },
        },
        wait(cb, 100),
      );
    }),
    pull.asyncMap((prevMsg, cb) => {
      ssb.db.create(
        {
          keys: lucyKeys,
          content: { type: 'post', text: 'Third message' },
        },
        wait(cb, 100),
      );
    }),
    pull.map(() => ssb.threads.hashtagSummary({ hashtag: 'food' })),
    pull.flatten(),

    pull.collect((err, summaries) => {
      t.error(err);
      t.equals(summaries.length, 1, 'only one summary');
      const summary = summaries[0];
      t.equals(summary.replyCount, 1, 'summary counts 1 reply');
      t.true(
        summary.timestamp > summary.root.timestamp,
        'summary timestamp greater than root timestamp',
      );
      t.equals(
        summary.root.value.content.root,
        undefined,
        'root message is root',
      );
      t.equals(summary.root.value.content.text, 'Pizza');

      ssb.close(t.end);
    }),
  );
});

test('threads.hashtagSummary input is case-insensitive', (t) => {
  const ssb = Testbot({ keys: lucyKeys });

  pull(
    pullAsync((cb) => {
      ssb.db.publish(
        { type: 'post', text: 'Pizza', channel: 'Food' },
        wait(cb, 100),
      );
    }),
    pull.asyncMap((rootMsg, cb) => {
      ssb.db.publish(
        { type: 'post', text: 'pepperoni', root: rootMsg.key },
        wait(cb, 100),
      );
    }),
    pull.asyncMap((prevMsg, cb) => {
      ssb.db.publish({ type: 'post', text: 'Third message' }, wait(cb, 100));
    }),
    pull.map(() => ssb.threads.hashtagSummary({ hashtag: 'food' })),
    pull.flatten(),

    pull.collect((err, summaries) => {
      t.error(err);
      t.equals(summaries.length, 1, 'only one summary');
      const summary = summaries[0];
      t.equals(summary.replyCount, 1, 'summary counts 1 reply');
      t.true(
        summary.timestamp > summary.root.timestamp,
        'summary timestamp greater than root timestamp',
      );
      t.equals(
        summary.root.value.content.root,
        undefined,
        'root message is root',
      );
      t.equals(summary.root.value.content.text, 'Pizza');

      ssb.close(t.end);
    }),
  );
});

test('threads.hashtagSummary understands msg.value.content.mentions', (t) => {
  const ssb = Testbot({ keys: lucyKeys });

  pull(
    pullAsync((cb) => {
      ssb.db.publish(
        { type: 'post', text: 'Dog', mentions: [{ link: '#animals' }] },
        wait(cb, 100),
      );
    }),
    pull.asyncMap((rootMsg, cb) => {
      ssb.db.publish(
        { type: 'post', text: 'poodle', root: rootMsg.key },
        wait(cb, 100),
      );
    }),
    pull.asyncMap((prevMsg, cb) => {
      ssb.db.publish({ type: 'post', text: 'Cat' }, wait(cb, 100));
    }),
    pull.map(() => ssb.threads.hashtagSummary({ hashtag: 'animals' })),
    pull.flatten(),

    pull.collect((err, summaries) => {
      t.error(err);
      t.equals(summaries.length, 1, 'only one summary');
      const summary = summaries[0];
      t.equals(summary.replyCount, 1, 'summary counts 1 reply');
      t.true(
        summary.timestamp > summary.root.timestamp,
        'summary timestamp greater than root timestamp',
      );
      t.equals(
        summary.root.value.content.root,
        undefined,
        'root message is root',
      );
      t.equals(summary.root.value.content.text, 'Dog');

      ssb.close(t.end);
    }),
  );
});
