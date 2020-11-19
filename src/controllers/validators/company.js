const Joi = require("joi");
const {
  errors: { BadRequestError },
} = require("../../utils");

const schemas = {
  createCompany: Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postcode: Joi.string().required(),
    documentType: Joi.string().required(),
    document: Joi.string().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    openDays: Joi.array().items(Joi.number().min(0).max(6)).required(),
  }),
  patchCompany: Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postcode: Joi.string().required(),
    documentType: Joi.string().required(),
    document: Joi.string().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required(),
    openDays: Joi.array().items(Joi.number().min(0).max(6)).required(),
  }),
};

module.exports = {
  createCompany: (req, res, next) => {
    const validation = schemas.createCompany.validate(req.body);
    if (!validation.error) return next();
    next(new BadRequestError(validation.error.details[0].message));
  },
  patchCompany: (req, res, next) => {
    const validation = schemas.patchCompany.validate(req.body);
    if (!validation.error) return next();
    next(new BadRequestError(validation.error.details[0].message));
  },
};
