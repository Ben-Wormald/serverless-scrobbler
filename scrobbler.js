'use strict';

const request = require('request-promise');
const md5 = require('js-md5');
const querystring = require('querystring');

const dropInvalidDurations = process.env.DROP_INVALID_DURATIONS === 'true';
const isLoggingEnabled = process.env.ENABLE_LOGGING === 'true';

function processDurations(data, count) {
  const currentTime = Math.floor((new Date()).getTime() / 1000);
  var durationSum = 0;

  for (var i = count - 1; i >= 0; i--) {
    durationSum += data[`duration[${i}]`];

    data[`timestamp[${i}]`] = currentTime - durationSum;

    if (dropInvalidDurations && (currentTime <= 30 || currentTime >= 3600)) {
      delete data[`duration[${i}]`];
    }
  }
  return data;
}

function processTrackData({ album, tracks }) {
  const trackData = {};
  let count = 0

  tracks.forEach((track, index) => {
    if (!track.title) return;

    const artist = track.artist || album.artist;
    const albumArtist = album.artist || track.artist;
    const albumTitle = track.album || album.album;

    var duration = track.duration.split(':');
    duration = duration.length === 1 ? parseInt(duration[0]) : parseInt(duration[0]) * 60 + parseInt(duration[1]);

    trackData[`artist[${index}]`] = artist;
    trackData[`albumArtist[${index}]`] = albumArtist;
    trackData[`album[${index}]`] = albumTitle;
    trackData[`track[${index}]`] = track.title;
    trackData[`duration[${index}]`] = duration;
    trackData[`trackNumber[${index}]`] = index + 1;

    count++;
  });

  return processDurations(trackData, count);
}

function generateSignature(data) {
  const urlParams = [];
  for (const key in data) {
    if (key !== 'format') {
      urlParams.push(key + data[key]);
    }
  }
  urlParams.sort();
  return md5(urlParams.join('') + process.env.SECRET_KEY);
}

function processResponse({ scrobbles }) {
  const response = {
    accepted: scrobbles['@attr'].accepted,
    ignored: [],
  };

  if (scrobbles['@attr'].ignored) {
    if (isLoggingEnabled) {
      console.log(scrobbles['@attr'].ignored + ' scrobbles ignored:');
    }

    scrobbles.scrobble.forEach(({ track, ignoredMessage }) => {
      if (ignoredMessage.code) {
        response.ignored.push({
          track: track['#text'],
          message: ignoredMessage['#text']
        });
        if (isLoggingEnabled) {
          console.log('  ' + track['#text'] + ': ' + ignoredMessage['#text']);
        }
      }
    });
  }
  return response;
}

async function scrobble(rawData) {
  const trackData = processTrackData(rawData);

  trackData.api_key = process.env.API_KEY;
  trackData.sk = process.env.SESSION_KEY;
  trackData.method = 'track.scrobble';
  trackData.format = 'json';
  trackData.api_sig = generateSignature(trackData);

  const body = querystring.stringify(trackData);

  const response = await request({
    method: 'POST',
    uri: 'http://ws.audioscrobbler.com/2.0/',
    body: body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return processResponse(JSON.parse(response));
}

module.exports.scrobble = async event => {
  console.log('event', event);
  const data = JSON.parse(event.body);
  const response = await scrobble(data);

  return {
    statusCode: 200,
    body: JSON.stringify(response, null, 2),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };
};
