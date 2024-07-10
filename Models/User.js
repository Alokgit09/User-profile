const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config();



const userSchema = new mongoose.Schema({
    name: {
    type: "string",
    required: true,
  },
  email: {
    type: String,
    require: true,
    unique: [true, "E-mail is already here"],
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid E-mail");
      }
    },
  },
  role: {
    type: String,
    required: true,
    default: "user", 
  },
  profileIcon: {
    type: "string",
    required: true,
  },
  password: {
    type: "string",
    required: true,
  },
 
});



userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    try {
      this.password = await bcrypt.hash(this.password, 10);
      next();
    } catch (err) {
      return next(err);
    }
  } else {
    next();
  }
});

const UserData = mongoose.model("User", userSchema);

module.exports = UserData;
