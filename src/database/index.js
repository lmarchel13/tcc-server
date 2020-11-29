const mongoose = require("mongoose");
const { DATABASE_URI } = require("../config");
const { logger } = require("../utils");

const log = logger("Database");

async function startDatabaseConnection() {
  return mongoose
    .connect(DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      log.info("Connected successfully to database");
      return;
    })
    .catch((err) => {
      log.error(`Could not connected to database: ${err.message}`);
      return;
    });
}

module.exports = {
  startDatabaseConnection,
};
