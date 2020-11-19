const { startDatabaseConnection } = require("./database");
const express = require("express");
const cookieParser = require("cookie-parser");
const controllers = require("./controllers");

startDatabaseConnection();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(controllers);

app.use(function (err, req, res, next) {
  const error = {
    description: err.description || err.body,
    code: err.code || err.statusCode,
  };

  return res.status(error.code || 500).send(error);
});

module.exports = app;
