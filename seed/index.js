const axios = require("axios");
const faker = require("faker");

const { PORT } = require("../src/config");
const { logger } = require("../src/utils");
const db = require("../src/database");
const models = require("../src/models");

const CATEGORIES = require("./categories.json");
const PLANS = require("./plans.json");
const SERVICES_BY_CATEGORY = require("./services.json");

const BASE_URL = `http://localhost:${PORT}`;
const DEFAULT_PASSWORD = "123456";
const NUMBER_OF_USERS = 50;
const DAYS_OPEN = ["0", "1", "2", "3", "4", "5", "6"];

faker.locale = "pt_BR";

const log = logger("Seed");

const chooseBetweenTwo = (a, b) => {
  return Math.random() * 10 > 5 ? a : b;
};

const chooseBetweenThree = (data) => {
  const n = Math.random();

  if (n < 0.333) return data[0];
  if (n < 0.666) return data[0];
  return data[2];
};

const chooseRandomFromArray = (array) => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

const createCategories = async () => {
  const endpoint = `${BASE_URL}/categories`;
  return await Promise.all(
    CATEGORIES.map(async (category) => {
      log.info("Adding category", JSON.stringify(category));
      const { data } = await axios.post(endpoint, category);
      return data;
    }),
  );
};

const createPlans = async () => {
  const endpoint = `${BASE_URL}/plans`;
  return await Promise.all(
    PLANS.map(async (plan) => {
      log.info("Adding plan", JSON.stringify(plan));
      const { data } = await axios.post(endpoint, plan);
      return data;
    }),
  );
};

const createUser = async () => {
  const endpoint = `${BASE_URL}/users/signup`;

  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  const email = `${firstName.split(" ").join("")}${lastName.split(" ").join("")}@gmail.com`;

  const payload = {
    firstName,
    lastName,
    email,
    password: DEFAULT_PASSWORD,
  };

  log.info("Creating user", JSON.stringify(payload));

  const { data } = await axios.post(endpoint, payload);

  log.info("User created", JSON.stringify(data));
  return { ...data, ...payload };
};

const login = async (email, password) => {
  const endpoint = `${BASE_URL}/users/signin`;
  const payload = { email, password };

  log.info("Signing in", JSON.stringify(payload));

  const { data } = await axios.post(endpoint, payload);

  log.info("Signed in", JSON.stringify(data));

  return data;
};

const createCompany = async (plans, token) => {
  const endpoint = `${BASE_URL}/companies`;

  const companyName = faker.company.companyName();
  const email = `${companyName.split(" ").join("")}@gmail.com`;
  const documentType = chooseBetweenTwo("CPF", "CNPJ");
  const openDays = [];
  const plan = chooseBetweenThree(plans);

  const address = `Rua ${faker.name.firstName()} ${faker.name.lastName()}, ${Math.floor(Math.random() * 1000)}`;

  DAYS_OPEN.forEach((day) => {
    if (Math.random() > 0.2) openDays.push(day);
  });

  const payload = {
    name: companyName,
    description: `Empresa com mais de ${Math.floor(Math.random() * 50)} anos de história`,
    email,
    phone: faker.phone.phoneNumber(),
    address,
    city: `${faker.name.firstName()} ${faker.name.lastName()}`,
    state: faker.address.stateAbbr(),
    postcode: faker.address.zipCode(),
    documentType,
    document: `${faker.random.number(999999999999)}`,
    startTime: chooseRandomFromArray(["08:00", "09:00", "10:00"]),
    endTime: chooseRandomFromArray(["17:00", "18:00", "19:00"]),
    openDays: openDays.length > 0 ? openDays : ["1", "2", "3"],
    plan: plan.id,
  };

  log.info("Creating company", JSON.stringify(payload));

  const { data } = await axios.post(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });

  log.info("Company created", JSON.stringify(data));

  return data;
};

const createService = async (company, category, token) => {
  const endpoint = `${BASE_URL}/companies/${company.id}/services`;

  const availableServices = SERVICES_BY_CATEGORY[category.name];
  const serviceName = chooseRandomFromArray(availableServices);
  const durations = ["00:30", "01:00", "01:30", "02:00", "03:00", "04:00"];
  const value = Math.floor(Math.random() * 1000);

  log.info("Creating service for company", { companyId: company.id, category: category.name });

  const payload = {
    name: serviceName,
    description: serviceName,
    categoryId: category.id,
    duration: chooseRandomFromArray(durations),
    type: chooseBetweenTwo("fixed", "by-hour"),
    value,
  };

  const { data } = await axios.post(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });

  log.info("Service created", JSON.stringify(data));

  return data;
};

const clearDatabase = async () => {
  await db.startDatabaseConnection();

  log.info("Clearing database...");

  try {
    for (const modelName in models) {
      const model = models[modelName];
      log.info("Deleting collection:", modelName);

      await model.deleteMany({}, (err) => {
        if (err) throw err;
      });
    }
  } catch (error) {
    log.info("Error while deleting database:", error);
  }
};

const startProcess = async (categories, plans) => {
  const user = await createUser();
  user.loginResponse = await login(user.email, user.password);

  let companyCounter = 0;
  const numOfCompanies = chooseRandomFromArray([1, 2, 3, 4, 5]);
  log.info(`Creating ${numOfCompanies} companies for user ${user.loginResponse.userId}`);

  while (companyCounter < numOfCompanies) {
    let servicesCounter = 0;
    const numOfServices = chooseBetweenThree([1, 2, 3, 4, 5]);

    const company = await createCompany(plans, user.loginResponse.jwt);
    const category = chooseRandomFromArray(categories);

    while (servicesCounter < numOfServices) {
      const service = await createService(company, category, user.loginResponse.jwt);

      company.services.push(service);

      servicesCounter++;
    }

    companyCounter++;
  }
};

const run = async (users = NUMBER_OF_USERS) => {
  await clearDatabase();

  const categories = await createCategories();
  log.info("Categories added successfully");

  const plans = await createPlans();
  log.info("Plans added successfully");

  try {
    console.time("PROCESS");
    await Promise.all(
      new Array(users).fill(0).map(async () => {
        return startProcess(categories, plans);
      }),
    );
    console.timeEnd("PROCESS");
  } catch (error) {
    log.error("Error:", error.message);
  }
};

module.exports = {
  run,
};
