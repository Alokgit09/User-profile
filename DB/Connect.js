const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://aalokyadav:12345@cluster0.xg88yai.mongodb.net/profile-signup?retryWrites=true&w=majority")
  .then(() => {
    console.log("connection successful");
  })
  .catch((error) => {
    console.log("somthing wrong", error);
  });