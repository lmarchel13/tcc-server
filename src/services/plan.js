const { Plan } = require("../models");

const find = async () => {
  return Plan.find().sort("value");
};

const createPlan = async (payload) => {
  const plan = new Plan(payload);
  await plan.save();

  return plan;
};

module.exports = {
  find,
  createPlan,
};
