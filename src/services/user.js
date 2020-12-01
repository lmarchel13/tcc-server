const { logger } = require("../utils");
const { User } = require("../models");
const log = logger("User Service");

const findByEmail = async (email) => {
  const user = await User.findOne({ email });

  return user;
};
const createUser = async (payload) => {
  const { firstName, lastName, email, salt, hashedPassword, googleId } = payload;
  const user = new User({ firstName, lastName, email, salt, hashedPassword, googleId });

  await user.save();
  return user;
};
const getById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found");

  return user;
};

const findByGoogleId = async (googleId) => {
  return User.findOne({ googleId });
};

module.exports = {
  findByEmail,
  createUser,
  getById,
  findByGoogleId,
};
