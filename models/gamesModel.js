const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    require: true,
    trim: true,
  },
  rating: {
    type: Number,
    default: 4,
  },
  ratingQuantity: {
    type: Number,
    default: 0,
  },
  played: {
    type: Number,
    default: 0,
  },
});

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
