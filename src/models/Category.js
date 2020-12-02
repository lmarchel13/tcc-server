const { Schema, model } = require("mongoose");
const { logger } = require("../utils");

const name = "Category";
const log = logger("Model loader");
log.info(`${name}`);

const schema = new Schema(
  {
    name: "string",
    icon: "string",
  },
  {
    toJSON: {
      transform(doc, ret) {
        const id = ret._id;
        delete ret._id;
        delete ret.__v;
        return { id, ...ret };
      },
    },
  },
);

module.exports = model(name, schema);
