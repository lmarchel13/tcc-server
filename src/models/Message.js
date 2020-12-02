const { Schema, model } = require("mongoose");
const { logger } = require("../utils");

const name = "Message";
const log = logger("Model loader");
log.info(`${name}`);

const schema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    text: "string",
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: "string", // USER or COMPANY
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
