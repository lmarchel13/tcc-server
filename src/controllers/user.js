const { Router } = require("express");
const { security } = require("../utils");
const {
  logger,
  errors: { BadRequestError, NotFoundError },
} = require("../utils");
const { UserService, CompanyService } = require("../services");
const { UserValidator } = require("./validators");
const { validateToken, getUserFromToken } = require("../middlewares");

const log = logger("Users Controller");
const router = Router();

router.post("/signup", UserValidator.createUser, async (req, res, next) => {
  const { firstName, lastName, email, password, googleId } = req.body;
  log.debug("Signup", { email, googleId });

  if (await UserService.findByEmail(email)) {
    return next(new BadRequestError("Email already in use"));
  }

  const payload = {
    firstName,
    lastName,
    email,
  };

  try {
    if (password) {
      log.debug("Signup with password");
      const salt = security.generateSalt();
      const { hashedPassword } = await security.generatePassword(password, salt);

      payload.salt = salt;
      payload.hashedPassword = hashedPassword;
    }

    if (googleId) {
      log.debug("Signup with OAuth2");
      payload.googleId = googleId;
    }

    const user = await UserService.createUser(payload);

    log.info("User created", user.id);

    return res.status(201).send({ id: user._id });
  } catch (error) {
    log.error("Error while signup:", error.message);
    next(error);
  }
});

router.post("/signin", async (req, res, next) => {
  const { email, password, googleId } = req.body;
  log.debug("Signin", { email, googleId, password });

  try {
    let user;

    if (email) {
      log.debug("Logging in with email");
      user = await UserService.findByEmail(email);

      if (!user) return next(new NotFoundError("Credenciais inválidas"));

      if (!password) return next(new BadRequestError("Credenciais inválidas"));

      if (!security.validatePassword(user, password)) return next(new NotFoundError("Credenciais inválidas"));
    }

    if (googleId) {
      log.debug("Logging in with OAuth2");
      user = await UserService.findByGoogleId(googleId);
      if (!user) return next(new NotFoundError("Credenciais inválidas"));
    }

    const jwt = security.createToken(user);
    const { _id: userId, firstName, lastName } = user;

    const userCompanies = await CompanyService.getUserCompanies(userId);

    const payload = { userId, firstName, lastName, jwt, userCompanies };

    log.info("Logged In", payload);

    return res.status(201).send(payload);
  } catch (error) {
    log.error("Error while signin:", error.message);
    next(error);
  }
});

router.patch("/", validateToken, getUserFromToken, async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const { userId } = req;

  try {
    if (!firstName || !lastName || !email || !password) {
      throw new BadRequestError("Preencha todos os campos antes de atualizar");
    }

    const user = await UserService.getById(userId);

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;

    const salt = security.generateSalt();
    const { hashedPassword } = await security.generatePassword(password, salt);

    user.salt = salt;
    user.hashedPassword = hashedPassword;

    await user.save();

    log.info("User updated", user);

    return res.send(user);
  } catch (error) {
    log.error("Error while updating user", error.message);
    next(error);
  }
});

router.get("/me", validateToken, getUserFromToken, async (req, res, next) => {
  const { userId } = req;

  try {
    const user = await UserService.getById(userId);
    return res.send(user);
  } catch (error) {
    log.error("Could not delete transaction", { id, error });
    next(error);
  }
});

module.exports = router;
