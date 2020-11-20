const {
  errors: { NotFoundError },
} = require("../utils");
const { Category } = require("../models");

const find = async ({ limit = 20, offset = 0 }) => {
  return Category.find()
    .limit(+limit)
    .skip(+offset);
};

const createCategory = async (payload) => {
  const category = new Category(payload);
  await category.save();

  return category;
};

const getById = async (id) => {
  const category = await Category.findById(id);

  if (!category) throw new NotFoundError("Category not found");

  return category;
};

module.exports = {
  find,
  createCategory,
  getById,
};
