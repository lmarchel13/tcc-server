const mongoose = require('mongoose');
const { DATABASE_URI } = require('../config');
const { logger } = require('../utils');

const log = logger('Database');

function startDatabaseConnection() {
  mongoose
    .connect(DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      log.info('Connected successfully to database');
    })
    .catch((err) => {
      log.error(`Could not connected to database: ${err.message}`);
    });
}

module.exports = {
  startDatabaseConnection,
};
