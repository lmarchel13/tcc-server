const { Schema, model } = require("mongoose");

const name = "Plan";
const schema = new Schema(
  {
    name: "string",
    value: "number",
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
