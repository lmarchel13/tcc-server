const { security } = require("../utils");
const { UnauthorizedError } = require("../utils/errors");

const validateToken = (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization.split(" ")[1];

  if (security.validateToken(token)) {
    req.token = token;
    return next();
  }

  next(new UnauthorizedError());
};

const getUserFromToken = (req, res, next) => {
  const { token } = req;
  const decoded = security.decodeToken(token);

  if (!decoded || !decoded.userId) {
    next(new UnauthorizedError("Invalid token"));
  }

  req.userId = decoded.userId;
  next();
};

module.exports = {
  validateToken,
  getUserFromToken,
};
