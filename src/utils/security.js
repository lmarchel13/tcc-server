const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { JWT_PRIVATE_KEY } = require("../config");
const logger = require("./logger");

const log = logger("Security");
const ROUNDS = 12;

const generatePassword = (password, salt) => {
  log.debug("Generating hash password");
  const hash = crypto.createHmac("sha512", salt);
  hash.update(password);
  const hashedPassword = hash.digest("hex");

  log.debug("Hash password generated");

  return { hashedPassword };
};
const validatePassword = (user, password) => {
  log.debug("Validating password");
  const { salt, hashedPassword } = user;
  const compare = generatePassword(password, salt);
  return compare.hashedPassword === hashedPassword;
};
const generateSalt = () => {
  return crypto
    .randomBytes(Math.ceil(ROUNDS / 2))
    .toString("hex")
    .slice(0, ROUNDS);
};
const createToken = (user) => {
  const { _id: userId, name, email } = user;
  return jwt.sign({ userId, name, email }, JWT_PRIVATE_KEY);
};

const validateToken = (token) => {
  return jwt.verify(token, JWT_PRIVATE_KEY);
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generatePassword,
  validatePassword,
  generateSalt,
  createToken,
  validateToken,
  decodeToken,
};
