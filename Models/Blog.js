const mongoose = require("mongoose");
require("dotenv").config();

const blogSchema = new mongoose.Schema({
  slug:{
    type: "string",
    required: true,
  },
  image: {
    type: "string",
    required: true,
  },
  heading: {
    type: "string",
    required: true,
  },
  content: {
    type: "string",
    required: true,
  },
  categories: {
    type: "string",
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Create a text index on the title and content fields
blogSchema.index({ heading: 'text', content: 'text' });

const blogData = mongoose.model("Blog", blogSchema);

module.exports = blogData;
