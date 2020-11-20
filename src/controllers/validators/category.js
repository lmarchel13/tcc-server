const Joi = require("joi");
const {
  errors: { BadRequestError },
} = require("../../utils");

const schemas = {
  createCategory: Joi.object({
    name: Joi.string().required(),
  }),
};

module.exports = {
  createCategory: (req, res, next) => {
    const validation = schemas.createCategory.validate(req.body);
    if (!validation.error) return next();
    next(new BadRequestError(validation.error.details[0].message));
  },
};
