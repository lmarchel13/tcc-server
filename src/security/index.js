const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { JWT_PRIVATE_KEY } = require('../config');
const { logger } = require('../utils');

const log = logger('Security');
const ROUNDS = 12;

const generatePassword = (password, salt) => {
  log.debug('Generating hash password');
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  const hashedPassword = hash.digest('hex');

  return { hashedPassword };
};
const validatePassword = (user, password) => {
  log.debug('Validating password');
  const { salt, hashedPassword } = user;
  const compare = generatePassword(password, salt);
  return compare.hashedPassword === hashedPassword;
};
const generateSalt = () => {
  return crypto
    .randomBytes(Math.ceil(ROUNDS / 2))
    .toString('hex')
    .slice(0, ROUNDS);
};
const createToken = (user) => {
  const { _id: id, name, email } = user;
  return jwt.sign({ id, name, email }, JWT_PRIVATE_KEY);
};

module.exports = {
  generatePassword,
  validatePassword,
  generateSalt,
  createToken,
};
