const Joi = require("joi");
const {
  errors: { BadRequestError },
  logger,
} = require("../../utils");

const log = logger("Company Validator");

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
    plan: Joi.string().required(),
  }),
  patchCompany: Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
    address: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    postcode: Joi.string(),
    documentType: Joi.string(),
    document: Joi.string(),
    startTime: Joi.string(),
    endTime: Joi.string(),
    openDays: Joi.array().items(Joi.number().min(0).max(6)),
    plan: Joi.string(),
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
