const { Schema, model } = require('mongoose');

const name = 'User';
const schema = new Schema({
  name: 'string',
  email: 'string',
  hashedPassword: 'string',
  salt: 'string',
});

module.exports = model(name, schema);
