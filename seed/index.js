const axios = require("axios");

const BASE_URL = "http://localhost:8000";
const CATEGORIES = require("./categories.json");
const PLANS = require("./plans.json");

const createCategories = async () => {
  const endpoint = `${BASE_URL}/categories`;
  return await Promise.all(
    CATEGORIES.map(async (category) => {
      console.log("Adding category", JSON.stringify(category));
      await axios.post(endpoint, category);
    }),
  );
};

const createPlans = async () => {
  const endpoint = `${BASE_URL}/plans`;
  return await Promise.all(
    PLANS.map(async (plan) => {
      console.log("Adding plan", JSON.stringify(plan));
      await axios.post(endpoint, plan);
    }),
  );
};

const run = async () => {
  await createCategories();
  await createPlans();
};

run();
