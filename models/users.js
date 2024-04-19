const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,
});

// Create and export the model
const User = mongoose.model("user", userSchema, "users");
module.exports = User;
