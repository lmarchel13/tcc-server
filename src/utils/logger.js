const chalk = require('chalk');
const { createLogger, format, transports } = require('winston');

const { combine, timestamp, label, printf } = format;

const colors = {
  info: 'green',
  warn: 'yellow',
  error: 'red',
  debug: 'blue',
};

module.exports = (instanceName) => {
  const customFormat = printf(
    ({ level, message, label, timestamp }) => `${timestamp} - [${label}] ${chalk[colors[level]](level)}: ${message}`,
  );

  return createLogger({
    format: combine(label({ label: instanceName }), timestamp(), customFormat, format.colorize()),
    transports: [new transports.Console()],
  });
};
