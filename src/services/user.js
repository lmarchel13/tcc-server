const { logger } = require("../utils");
const { User } = require("../models");
const log = logger("User Service");

module.exports = {
  findByEmail: async (email) => {
    const user = await User.findOne({ email });

    return user;
  },
  createUser: async (payload) => {
    const { name, email, salt, hashedPassword } = payload;
    const user = new User({ name, email, salt, hashedPassword });

    await user.save();
    return user;
  },
};
