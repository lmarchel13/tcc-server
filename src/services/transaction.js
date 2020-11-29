const { Transaction } = require("../models");
const CompanyService = require("./company");

const getBuyerTransactions = async (buyerId, { limit = 20, offset = 0 }) => {
  return Transaction.find({ buyer: { _id: buyerId } })
    .populate("seller")
    .populate("buyer")
    .populate("service")
    .limit(+limit)
    .skip(+offset);
};

const getSellerTransactions = async (sellerId, { limit = 20, offset = 0 }) => {
  const companies = await CompanyService.getUserCompanies(sellerId);
  if (!companies.length) return [];

  const companyIDs = companies.map((company) => company.id);

  return Transaction.find({ seller: { _id: companyIDs } })
    .populate("seller")
    .populate("buyer")
    .populate("service")
    .limit(+limit)
    .skip(+offset);
};

const getCompanyTransactions = async (sellerId, { limit, offset }) => {
  return Transaction.find({ seller: { _id: sellerId } })
    .limit(+limit)
    .skip(+offset);
};

const deleteTransaction = async ({ userId, id }) => {
  return Transaction.findOneAndDelete({ sellerId: userId, _id: id });
};

const validateTransaction = async (serviceId, day, time) => {
  const transaction = await Transaction.findOne({ service: { _id: serviceId }, day, time });

  return !!transaction;
};

const getTransactions = async ({ serviceId, day }) => {
  let options = {};

  if (serviceId) options.service = { _id: serviceId };
  if (day) options.day = day;

  return Transaction.find(options);
};

module.exports = {
  getBuyerTransactions,
  getSellerTransactions,
  getCompanyTransactions,
  deleteTransaction,
  validateTransaction,
  getTransactions,
};
