require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DATABASE_URI: process.env.DATABASE_URI,
  JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY || 'some-private-key',
};
