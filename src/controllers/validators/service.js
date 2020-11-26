const Joi = require("joi");
const {
  errors: { BadRequestError },
} = require("../../utils");

const schemas = {
  createService: Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    categoryId: Joi.string().required(),
    duration: Joi.string(),
    type: Joi.string().required(),
    value: Joi.number().min(0).required(),
  }),
  patchService: Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    categoryId: Joi.string(),
    duration: Joi.string(),
    type: Joi.string(),
    value: Joi.number().min(0),
  }),
};

module.exports = {
  createService: (req, res, next) => {
    const validation = schemas.createService.validate(req.body);
    if (!validation.error) return next();
    next(new BadRequestError(validation.error.details[0].message));
  },
  patchService: (req, res, next) => {
    const validation = schemas.patchService.validate(req.body);
    if (!validation.error) return next();
    next(new BadRequestError(validation.error.details[0].message));
  },
};
