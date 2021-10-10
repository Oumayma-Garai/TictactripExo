const Joi = require("joi");
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  usedWords: {
    type: Number,
  },
},
{
  collection: 'users',
  timestamps: true
});
const User = new mongoose.model("User", userSchema);
function validateUser(user) {
  const schema = {
    email: Joi.string().min(3).max(255).required().email(),
  };
  return Joi.validate(user, schema);
}

module.exports = validateUser
module.exports = User
