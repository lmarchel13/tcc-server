const axios = require("axios");
const faker = require("faker");

const { logger } = require("../src/utils");

const db = require("../src/database");
const models = require("../src/models");

const CATEGORIES = require("./categories.json");
const PLANS = require("./plans.json");
const SERVICES_BY_CATEGORY = require("./services.json");

const BASE_URL = "http://localhost:8000";
const DEFAULT_PASSWORD = "123456";
const NUMBER_OF_USERS = 20;
const NUMBER_OF_COMPANIES = 60;
const DAYS_OPEN = ["0", "1", "2", "3", "4", "5", "6"];

faker.locale = "pt_BR";

const log = logger("Seed");

const chooseBetweenTwo = (a, b) => {
  return Math.random() > 0.5 ? a : b;
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

  DAYS_OPEN.forEach((day) => {
    if (Math.random() > 0.5) openDays.push(day);
  });

  const payload = {
    name: companyName,
    description: `Empresa com mais de ${Math.floor(Math.random() * 50)} anos de história`,
    email,
    phone: faker.phone.phoneNumber(),
    address: faker.address.streetAddress(),
    city: faker.address.city(),
    state: faker.address.state(),
    postcode: faker.address.zipCode(),
    documentType,
    document: `${faker.random.number(999999999999)}`,
    startTime: "08:00",
    endTime: "17:00",
    openDays,
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

const run = async () => {
  await clearDatabase();

  const users = [];
  const companies = [];

  const categories = await createCategories();
  log.info("Categories added successfully");

  const plans = await createPlans();
  log.info("Plans added successfully");

  try {
    while (users.length < NUMBER_OF_USERS) {
      const user = await createUser();

      user.loginResponse = await login(user.email, user.password);
      users.push(user);

      while (companies.length < NUMBER_OF_COMPANIES) {
        let companyCounter = 0;

        const numOfCompanies = chooseBetweenThree([1, 2, 3]);

        log.info(`Creating ${numOfCompanies} companies for user ${user.loginResponse.userId}`);

        while (companyCounter < numOfCompanies) {
          let servicesCounter = 0;
          const numOfServices = chooseBetweenThree([1, 3, 5]);
          0;

          const company = await createCompany(plans, user.loginResponse.jwt);
          const category = chooseRandomFromArray(categories);

          company.services = [];

          while (servicesCounter < numOfServices) {
            const service = await createService(company, category, user.loginResponse.jwt);

            company.services.push(service);

            servicesCounter++;
          }

          companies.push(company);
          companyCounter++;
        }
      }
    }
  } catch (error) {
    log.error("Error:", error.message);
  }

  process.exit(1);
};

run();
