import tap from 'tap';
import { processTrackData, generateSignature } from '../src/scrobbler.js';

tap.test('processTrackData', async t => {
  t.test('generates the right properties for a standard album', async t => {
    const data = {
      album: {
        album: 'everything perfect is already here',
        artist: 'claire rousay',
      },
      tracks: [
        {
          title: 'it feels foolish to care',
          duration: '15:05',
        },
        {
          title: 'everything perfect is already here',
          duration: '15:11',
        },
      ],
    };

    const expected = {
      'artist[0]': 'claire rousay',
      'albumArtist[0]': 'claire rousay',
      'album[0]': 'everything perfect is already here',
      'track[0]': 'it feels foolish to care',
      'duration[0]': 905,
      'trackNumber[0]': 1,
      'artist[1]': 'claire rousay',
      'albumArtist[1]': 'claire rousay',
      'album[1]': 'everything perfect is already here',
      'track[1]': 'everything perfect is already here',
      'duration[1]': 911,
      'trackNumber[1]': 2,
      'timestamp[0]': 1652349781,
      'timestamp[1]': 1652350686,
    };

    const actual = processTrackData(data);

    actual['timestamp[0]'] = expected['timestamp[0]'];
    actual['timestamp[1]'] = expected['timestamp[1]'];

    t.same(actual, expected);
  });

  t.test('generates the right properties for a compilation', async t => {
    const data = {
      album: {
        album: 'Break / Freaking Me In',
        artist: 'Various Artists',
      },
      tracks: [
        {
          title: 'Break',
          artist: 'Water From Your Eyes',
          duration: '9:49',
        },
        {
          title: 'Flip',
          artist: 'This Is Lorelei',
          duration: '1:28',
        },
        {
          title: 'Freaking Me In',
          artist: 'This Is Lorelei',
          duration: '7:12',
        },
      ],
    };

    const expected = {
      'artist[0]': 'Water From Your Eyes',
      'albumArtist[0]': 'Various Artists',
      'album[0]': 'Break / Freaking Me In',
      'track[0]': 'Break',
      'duration[0]': 589,
      'trackNumber[0]': 1,
      'artist[1]': 'This Is Lorelei',
      'albumArtist[1]': 'Various Artists',
      'album[1]': 'Break / Freaking Me In',
      'track[1]': 'Flip',
      'duration[1]': 88,
      'trackNumber[1]': 2,
      'artist[2]': 'This Is Lorelei',
      'albumArtist[2]': 'Various Artists',
      'album[2]': 'Break / Freaking Me In',
      'track[2]': 'Freaking Me In',
      'duration[2]': 432,
      'trackNumber[2]': 3,
      'timestamp[0]': 1652349781,
      'timestamp[1]': 1652350686,
      'timestamp[2]': 1652351532,
    };

    const actual = processTrackData(data);

    actual['timestamp[0]'] = expected['timestamp[0]'];
    actual['timestamp[1]'] = expected['timestamp[1]'];
    actual['timestamp[2]'] = expected['timestamp[2]'];

    t.same(actual, expected);
  });
});

tap.test('generateSignature', async t => {
  t.test('generates the right signature', async t => {
    process.env.SECRET_KEY = 'my-secret-key';

    const data = {
      'artist[0]': 'claire rousay',
      'albumArtist[0]': 'claire rousay',
      'album[0]': 'everything perfect is already here',
      'track[0]': 'it feels foolish to care',
      'duration[0]': 905,
      'trackNumber[0]': 1,
      'artist[1]': 'claire rousay',
      'albumArtist[1]': 'claire rousay',
      'album[1]': 'everything perfect is already here',
      'track[1]': 'everything perfect is already here',
      'duration[1]': 911,
      'trackNumber[1]': 2,
      'timestamp[0]': 1652349781,
      'timestamp[1]': 1652350686,
      api_key: 'my-api-key',
      sk: 'my-secret-key',
      method: 'track.scrobble',
      format: 'json',
    };

    const expected = '4328550112d16028a1a59a0b1e7d4a6d';

    const actual = generateSignature(data);

    t.equal(actual, expected);
  });
});
