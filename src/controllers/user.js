const { Router } = require("express");
const { security } = require("../utils");
const {
  logger,
  errors: { BadRequestError, NotFoundError },
} = require("../utils");
const { UserService } = require("../services");
const { UserValidator } = require("./validators");

const log = logger("Users Controller");
const router = Router();

router.post("/signup", UserValidator.createUser, async (req, res, next) => {
  const { name, email, password } = req.body;
  const salt = security.generateSalt();
  const { hashedPassword } = await security.generatePassword(password, salt);

  log.debug("Signup", { email });

  if (await UserService.findByEmail(email)) return next(new BadRequestError("Email already in use"));

  const user = await UserService.createUser({ name, email, salt, hashedPassword });

  return res.status(201).send({ id: user._id });
});

router.post("/signin", async (req, res, next) => {
  const { email, password } = req.body;
  log.debug("Signin", { email });
  const user = await UserService.findByEmail(email);

  if (!user) return next(new NotFoundError("Invalid credentials"));
  if (!security.validatePassword(user, password)) return next(new NotFoundError("Invalid credentials"));

  const jwt = security.createToken(user);
  const { _id: userId, name } = user;

  const payload = { userId, name, jwt };

  return res.status(201).send(payload);
});

module.exports = router;
