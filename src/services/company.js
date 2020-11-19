const { logger } = require("../utils");
const { Company } = require("../models");

const find = ({ limit, offset }) => {
  return Company.find()
    .limit(+limit)
    .skip(+offset);
};

const getCompanyById = async (id) => {
  const company = await Company.findById(id);
  if (!company) throw new NotFoundError("Company not found");
  return company;
};

const createCompany = async (payload) => {
  const company = new Company(payload);
  await company.save();

  return company;
};

const updateCompany = async (id, payload) => {
  return Company.updateOne({ _id: id }, payload);
};

module.exports = {
  find,
  getCompanyById,
  updateCompany,
  createCompany,
};
