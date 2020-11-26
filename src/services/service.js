const { Service } = require("../models");
const Company = require("../models/Company");
const {
  errors: { NotFoundError },
} = require("../utils");

const getById = async (id) => {
  const service = await Service.findById(id).populate("company");

  if (!service) throw new NotFoundError("Service not found");

  return service;
};
const getByCompanyId = async (companyId) => {
  return Service.find({ company: { _id: companyId } }).populate("category");
};
const createService = async (payload) => {
  return Service.create(payload);
};
const updateService = async (id, payload) => {
  return Service.findByIdAndUpdate(id, payload);
};

const deleteService = async (id) => {
  return Service.findByIdAndDelete(id);
};

const getLastOffers = async (limit = 20) => {
  return Service.find({})
    .limit(+limit)
    .sort("desc");
};

const search = async (name = "", { limit, offset }) => {
  return Service.find({ name: { $regex: name } })
    .populate("company", "id name plan", null, { populate: { path: "plan" } })
    .sort("-company plan value");
};

const getByCategoryId = async (categoryId, { limit, offset }) => {
  return Service.find({ categoryId })
    .limit(+limit)
    .skip(+offset);
};

module.exports = {
  getById,
  getByCompanyId,
  createService,
  updateService,
  deleteService,
  getLastOffers,
  search,
  getByCategoryId,
};
