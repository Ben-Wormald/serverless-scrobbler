const isLoggingEnabled = process.env.ENABLE_LOGGING === 'true';

const log = isLoggingEnabled ? console.log : () => {};
const warn = isLoggingEnabled ? console.warn : () => {};
const error = isLoggingEnabled ? console.error : () => {};

module.exports = {
  log,
  warn,
  error,
};
