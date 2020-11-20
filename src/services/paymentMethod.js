const { PaymentMethod } = require("../models");
const { DEFAULT_PAYMENT_METHODS } = require("../config");
const { BadRequestError } = require("../utils/errors");

const getByCompanyId = async (companyId) => {
  const paymentMethods = await PaymentMethod.find({ companyId });

  return res.send(paymentMethods);
};

const defaultPaymentMethods = () => {
  return DEFAULT_PAYMENT_METHODS;
};

const addPaymentMethods = async (company, payload) => {
  if (!Array.isArray(payload)) payload = [payload];

  return Promise.all(
    payload.map(async (name) => {
      if (!DEFAULT_PAYMENT_METHODS.includes(name)) throw new BadRequestError("Payment method not allowed");

      const paymentMethod = { name, company };
      return PaymentMethod.create(paymentMethod);
    }),
  );
};

const getById = async (id) => {
  const paymentMethod = await PaymentMethod.findById(id);
  if (!paymentMethod) throw new NotFoundError("Payment method not found");

  return paymentMethod;
};

const deletePaymentMethod = async (id) => {
  await PaymentMethod.findByIdAndDelete(id);
};

module.exports = {
  getByCompanyId,
  defaultPaymentMethods,
  addPaymentMethods,
  getById,
  deletePaymentMethod,
};
