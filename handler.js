const { scrobble } = require('./src/scrobbler');

const handler = async (event) => {
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

module.exports = {
  handler,
};
