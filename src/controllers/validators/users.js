const Joi = require('joi');
const {
  errors: { BadRequestError },
} = require('../../utils');

const schemas = {
  createUserSchema: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

module.exports = {
  createUser: (req, res, next) => {
    const validation = schemas.createUserSchema.validate(req.body);
    if (!validation.error) return next();
    next(new BadRequestError(validation.error.details[0].message));
  },
};
