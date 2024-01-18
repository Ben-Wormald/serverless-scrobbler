import md5 from 'js-md5';
import logger from './logger.js';

const dropInvalidDurations = process.env.DROP_INVALID_DURATIONS === 'true';

const processDurations = (data, count) => {
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
};

const processTrackData = ({ album, tracks }) => {
  const trackData = {};
  let count = 0

  tracks
    .filter(({ title, duration}) => title && duration)
    .forEach((track, index) => {
      var duration = track.duration.split(':');
      duration = duration.length === 1 ? parseInt(duration[0]) : parseInt(duration[0]) * 60 + parseInt(duration[1]);

      trackData[`artist[${index}]`] = track.artist || album.artist;
      trackData[`albumArtist[${index}]`] = album.artist;
      trackData[`album[${index}]`] = album.album;
      trackData[`track[${index}]`] = track.title;
      trackData[`duration[${index}]`] = duration;
      trackData[`trackNumber[${index}]`] = index + 1;

      count++;
    });

  return processDurations(trackData, count);
};

const generateSignature = (data) => {
  const urlParams = [];
  for (const key in data) {
    if (key !== 'format') {
      urlParams.push(key + data[key]);
    }
  }
  urlParams.sort();
  return md5(urlParams.join('') + process.env.SECRET_KEY);
};

const processResponse = ({ scrobbles }) => {
  const response = {
    accepted: scrobbles['@attr'].accepted,
    ignored: [],
  };

  if (scrobbles['@attr'].ignored) {
    logger.log(scrobbles['@attr'].ignored + ' scrobbles ignored:');

    scrobbles.scrobble.forEach(({ track, ignoredMessage }) => {
      if (ignoredMessage.code) {
        response.ignored.push({
          track: track['#text'],
          message: ignoredMessage['#text']
        });

        logger.log('  ' + track['#text'] + ': ' + ignoredMessage['#text']);
      }
    });
  }
  return response;
};

const scrobble = async (rawData) => {
  const trackData = processTrackData(rawData);

  trackData.api_key = process.env.API_KEY;
  trackData.sk = process.env.SESSION_KEY;
  trackData.method = 'track.scrobble';
  trackData.format = 'json';
  trackData.api_sig = generateSignature(trackData);

  const body = new URLSearchParams(trackData).toString();

  const response = await fetch('http://ws.audioscrobbler.com/2.0/', { method: 'POST', body });
  const json = await response.json();

  return processResponse(json);
};

export {
  scrobble,
  processTrackData,
  generateSignature,
};
