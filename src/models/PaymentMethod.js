const { Schema, model } = require("mongoose");

const name = "PaymentMethod";
const schema = new Schema(
  {
    name: "string",
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
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
