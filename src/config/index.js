const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, `../../.env.${process.env.NODE_ENV}`),
});

const DEFAULT_PAYMENT_METHODS = ["Dinheiro", "Cartão Débito", "Cartão Crédito"];

module.exports = {
  ENV_MODE: process.env.NODE_ENV || "dev",
  PORT: process.env.PORT || 3000,
  DATABASE_URI: process.env.DATABASE_URI,
  JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY || "some-private-key",
  DEFAULT_PAYMENT_METHODS: process.env.DEFAULT_PAYMENT_METHODS || DEFAULT_PAYMENT_METHODS,
  OAUTH_ID: process.env.OAUTH_ID || "527214406910-5rkm3vv611cftn5o8969539m3dreg6t6.apps.googleusercontent.com",
  OAUTH_SECRET_KEY: process.env.OAUTH_SECRET_KEY || "LFkX3xJCQT6JhbiipfKe48GZ",
};
