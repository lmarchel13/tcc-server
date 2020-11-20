const {
  errors: { NotFoundError },
} = require("../utils");
const { Company } = require("../models");

const find = ({ limit, offset }) => {
  return Company.find()
    .limit(+limit)
    .skip(+offset);
};

const getCompanyById = async (id) => {
  const company = await Company.findOne({ _id: id }).populate("user", "id name email");

  if (!company) throw new NotFoundError("Company not found");
  return company;
};

const getUserCompanies = async (userId) => {
  return Company.find({ userId });
};

const createCompany = async (payload) => {
  const company = new Company(payload);
  await company.save();

  return company;
};

const updateCompany = async (id, payload) => {
  return Company.updateOne({ _id: id }, payload);
};

const deleteCompany = async (id) => {
  // TODO: Delete services from this company and other dependencies
  return Company.deleteOne({ _id: id });
};

module.exports = {
  find,
  getCompanyById,
  updateCompany,
  createCompany,
  deleteCompany,
  getUserCompanies,
};
