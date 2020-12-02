const { Schema, model } = require("mongoose");
const { logger } = require("../utils");

const name = "Transaction";
const log = logger("Model loader");
log.info(`${name}`);

const schema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
    },
    value: "number",
    time: "string",
    day: "string",
  },
  {
    timestamps: true,
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
