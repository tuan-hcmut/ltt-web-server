const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    require: [true, "comment cannnot be empty!!!"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    require: [true, "cannot be empty!!!"],
  },
  user: {},
});
