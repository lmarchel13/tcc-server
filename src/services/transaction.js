const { Transaction } = require("../models");
const Company = require("../models/Company");
const CompanyService = require("./company");

const getBuyerTransactions = async (buyerId, { limit, offset }) => {
  return Transaction.find({ buyerId })
    .limit(+limit)
    .skip(+offset);
};

const getSellerTransactions = async (sellerId, { limit, offset }) => {
  const companies = await CompanyService.getUserCompanies(sellerId);

  const companyIDs = companies.map((company) => company.id);

  return Transaction.find({ sellerId: { $in: companyIDs } })
    .limit(+limit)
    .skip(+offset);
};

const getCompanyTransactions = async (sellerId, { limit, offset }) => {
  return Transaction.find({ sellerId })
    .limit(+limit)
    .skip(+offset);
};

const deleteTransaction = async ({ userId, id }) => {
  return Transaction.findOneAndDelete({ sellerId: userId, _id: id });
};

module.exports = {
  getBuyerTransactions,
  getSellerTransactions,
  getCompanyTransactions,
  deleteTransaction,
};
