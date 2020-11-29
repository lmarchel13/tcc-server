const { Service, Company } = require("../models");
const Category = require("../models/Category");
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
  const company = await Company.findById(payload.company.id);
  const service = await Service.create(payload);

  company.services.push(service);
  await company.save();

  return service;
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

const search = async (name = "", { limit = 20, offset = 0 }) => {
  console.log("search service by name", name);
  return Service.find({ name: { $regex: new RegExp(name, "i") } })
    .populate("company", "id name plan openDays startTime endTime", null, { populate: { path: "plan" } })
    .sort("-company plan value")
    .limit(+limit)
    .skip(+offset);
};

const getByCategoryId = async (categoryId, { limit, offset }) => {
  return Service.find({ category: { _id: categoryId } })
    .limit(+limit)
    .skip(+offset)
    .populate("company");
};

const getServicesByDay = async (day, { limit = 20, offset = 0 }) => {
  return Company.find({ openDays: `${day}` })
    .populate("plan")
    .populate("services")
    .limit(+limit)
    .skip(+offset)
    .sort("-plan");
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
  getServicesByDay,
};
