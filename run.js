const { scrobble } = require('./src/scrobbler');

const data = {
  album: {
    album: 'Nisf Madeena',
    artist: 'Various Artists',
  },
  tracks: [
    {
      title: 'Playing With You',
      artist: 'Nicolas Jaar',
      duration: '7:15',
    },
  ],
};

const run = async () => {
  const resp = await scrobble(data);
  console.log(resp);
};

run();
