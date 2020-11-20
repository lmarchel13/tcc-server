const { Schema, model } = require("mongoose");
const { omit } = require("lodash");

const name = "User";
const schema = new Schema(
  {
    name: "string",
    email: "string",
    hashedPassword: "string",
    salt: "string",
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
