const chalk = require("chalk");
const { ENV_MODE } = require("../config");
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
    logger[level] = (msg, ...metadata) => {
      if (ENV_MODE !== "test") {
        console.log(
          `${new Date().toUTCString()} - [${instanceName}] ${chalk[colors[level]](level)}:`,
          msg,
          ...metadata,
        );
      }
    };
  });
  return logger;
};
