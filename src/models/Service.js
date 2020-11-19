const { string } = require("joi");
const { Schema, model } = require("mongoose");

const name = "Service";
const schema = new Schema({
  name: "string",
  description: "string",
  duration: "string",
  type: "string",
  value: "number",
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
});

module.exports = model(name, schema);
