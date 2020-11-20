const Joi = require("joi");
const {
  errors: { BadRequestError },
} = require("../../utils");

const schemas = {
  createTransaction: Joi.object({
    value: Joi.number().required(),
    serviceId: Joi.string().required(),
    companyId: Joi.string().required(),
  }),
};

module.exports = {
  createTransaction: (req, res, next) => {
    const validation = schemas.createCategory.validate(req.body);
    if (!validation.error) return next();
    next(new BadRequestError(validation.error.details[0].message));
  },
};
