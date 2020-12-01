const Joi = require("joi");
const {
  errors: { BadRequestError },
} = require("../../utils");

const schemas = {
  createUser: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string(),
    googleId: Joi.string(),
  }),
};

module.exports = {
  createUser: (req, res, next) => {
    const validation = schemas.createUser.validate(req.body);
    if (!validation.error) return next();
    next(new BadRequestError(validation.error.details[0].message));
  },
};
