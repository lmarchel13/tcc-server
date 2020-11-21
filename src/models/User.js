const { Schema, model } = require("mongoose");
const { omit } = require("lodash");

const name = "User";
const schema = new Schema(
  {
    firstName: "string",
    lastName: "string",
    email: "string",
    hashedPassword: "string",
    salt: "string",
    companies: [{ type: Schema.Types.ObjectId, ref: "Company" }],
  },
  {
    toJSON: {
      transform(doc, ret) {
        return { id: ret._id, ...omit(ret, ["_id", "__v", "hashedPassword", "salt"]) };
      },
    },
  },
);

module.exports = model(name, schema);
