require("dotenv").config();

const DEFAULT_PAYMENT_METHODS = ["Dinheiro", "Cartão Débito", "Cartão Crédito"];

module.exports = {
  PORT: process.env.PORT || 3000,
  DATABASE_URI: process.env.DATABASE_URI,
  JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY || "some-private-key",
  DEFAULT_PAYMENT_METHODS: process.env.DEFAULT_PAYMENT_METHODS || DEFAULT_PAYMENT_METHODS,
};
