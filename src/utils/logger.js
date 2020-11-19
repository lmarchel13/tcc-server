const chalk = require("chalk");

const colors = {
  info: "green",
  warn: "yellow",
  error: "red",
  debug: "blue",
};

const levels = ["info", "debug", "warn", "error"];

module.exports = (instanceName) => {
  const logger = {};
  levels.forEach((level) => {
    logger[level] = (msg, ...metadata) =>
      console.log(`${new Date().toUTCString()} - [${instanceName}] ${chalk[colors[level]](level)}:`, msg, ...metadata);
  });
  return logger;
};
