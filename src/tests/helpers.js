const defaultCategories = require("../../seed/categories.json");
const defaultPlans = require("../../seed/plans.json");
const { Category, Service, Company, User, Plan, Transaction, Message, Conversation } = require("../models");

const clearDatabase = async () => {
  const deletes = [
    Category.deleteMany({}),
    Plan.deleteMany({}),
    Service.deleteMany({}),
    User.deleteMany({}),
    Company.deleteMany({}),
    Transaction.deleteMany({}),
    Message.deleteMany({}),
    Conversation.deleteMany({}),
  ];

  await Promise.all(deletes);
};

const createDefaultCategories = async () => {
  await Promise.all(
    defaultCategories.map((category) => {
      return new Category(category).save();
    }),
  );
};

const createService = async (request, { token, category, company, name = "SomeService" }) => {
  const { id: companyId } = company;
  const payload = {
    name,
    description: "SomeServiceDescription",
    categoryId: category.id,
    duration: "00:30",
    type: "fixed",
    value: 100,
  };

  const { body } = await request
    .post(`/companies/${companyId}/services`)
    .set("Authorization", `Bearer ${token}`)
    .send(payload);

  return body;
};

const createDefaultPlans = async () => {
  await Promise.all(
    defaultPlans.map((p) => {
      return new Plan(p).save();
    }),
  );
};

const createCompany = async (request, { plan, token, name = "SomeCompany" }) => {
  const payload = {
    name,
    description: "SomeCompanyDescription",
    email: "some@email.com",
    phone: "123456789",
    address: "Rua ABC, 123",
    city: "São Paulo",
    state: "SP",
    postcode: "03647020",
    documentType: "CPF",
    document: "123456789",
    startTime: "08:00",
    endTime: "17:00",
    openDays: [0, 1, 2, 3, 4, 5, 6],
    plan: plan.id,
  };

  const { body } = await request.post("/companies").set("Authorization", `Bearer ${token}`).send(payload);

  return body;
};

const createUser = async (request, { email = "lucasmarchel13@gmail.com" } = {}) => {
  const { body } = await request.post("/users/signup").send({
    firstName: "Lucas",
    lastName: "Ferreira",
    email,
    password: "123456",
  });

  return body.id;
};

const login = async (request, { email = "lucasmarchel13@gmail.com", password = "123456" } = {}) => {
  const { body } = await request.post("/users/signin").send({ email, password });

  return body;
};

const bookService = async (request, { company, service, token, time, day }) => {
  const { body } = await request.post(`/services/${service.id}/book`).set("Authorization", `Bearer ${token}`).send({
    companyId: company.id,
    value: service.value,
    time,
    day,
  });

  return body;
};

module.exports = {
  clearDatabase,
  createDefaultCategories,
  createService,
  createDefaultPlans,
  createCompany,
  createUser,
  login,
  bookService,
};
