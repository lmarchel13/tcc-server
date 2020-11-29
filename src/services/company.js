const {
  errors: { NotFoundError },
} = require("../utils");
const { Company } = require("../models");

const find = ({ limit, offset, term }) => {
  return Company.find({ name: { $regex: new RegExp(term, "i") } })
    .limit(+limit)
    .skip(+offset)
    .populate("plan");
};

const getCompanyById = async (id) => {
  const company = await Company.findOne({ _id: id }).populate("user", "id name email").populate("plan");

  if (!company) throw new NotFoundError("Company not found");
  return company;
};

const getUserCompanies = async (userId) => {
  return Company.find({ user: userId }).populate("plan", "id name value").populate("services");
};

const createCompany = async (payload) => {
  const company = new Company(payload);
  await company.save();

  return getCompanyById(company.id);
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
