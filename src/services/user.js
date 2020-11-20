const { logger } = require("../utils");
const { User } = require("../models");
const log = logger("User Service");

const findByEmail = async (email) => {
  const user = await User.findOne({ email });

  return user;
};
const createUser = async (payload) => {
  const { name, email, salt, hashedPassword } = payload;
  const user = new User({ name, email, salt, hashedPassword });

  await user.save();
  return user;
};
const getById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found");

  return user;
};

module.exports = {
  findByEmail,
  createUser,
  getById,
};
