const tap = require('tap')

const { scrobble } = tap.mock('../src/scrobbler', {
  got: {
    post: () => ({
      scrobbles: {
        '@attr': {
          accepted: 10,
        },
      },
    }),
  },
});

tap.test('scrobble', async t => {
  const data = {

  };
});
