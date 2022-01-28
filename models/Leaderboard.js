const mongoose = require("mongoose");

const leaderBoardSchema = new mongoose.Schema({
  contestId,
  Leaderboard: [
    {
      position: {
        type: Number,
        required: true,
      },
      user: {
        type: String,
        required: true,
        unique: true,
      },
    },
  ],
});

module.exports = mongoose.model("Leaderboard", leaderBoardSchema);
