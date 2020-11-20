const { red } = require("chalk");
const { Schema, model } = require("mongoose");

const name = "Category";
const schema = new Schema(
  {
    name: "string",
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
