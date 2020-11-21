const { security, logger } = require("../utils");
const { UnauthorizedError } = require("../utils/errors");

const log = logger("Middlewares");

const validateToken = (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization.split(" ")[1];
  log.info("Validating token", { token });

  if (security.validateToken(token)) {
    req.token = token;
    return next();
  }

  next(new UnauthorizedError("Credenciais inválidas"));
};

const getUserFromToken = (req, res, next) => {
  log.info("Get user from token");
  const { token } = req;
  const decoded = security.decodeToken(token);

  if (!decoded || !decoded.userId) {
    next(new UnauthorizedError("Credenciais inválidas"));
  }

  req.userId = decoded.userId;
  next();
};

module.exports = {
  validateToken,
  getUserFromToken,
};
