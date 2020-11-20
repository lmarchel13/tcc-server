const { Schema, model } = require("mongoose");

const name = "Company";
const schema = new Schema(
  {
    name: "string",
    description: { type: "string", required: false },
    email: "string",
    phone: "string",
    address: "string",
    city: "string",
    state: "string",
    postcode: "string",
    documentType: "string",
    document: "string",
    startTime: "string",
    endTime: "string",
    openDays: {
      type: [Schema.Types.String],
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    plan: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
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
