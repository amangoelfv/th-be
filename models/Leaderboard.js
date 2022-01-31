const mongoose = require("mongoose");

const leaderBoardSchema = new mongoose.Schema({
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "contest",
  },
  lastUpdated: {
    type: mongoose.Schema.Types.Date,
    required: true
  },
  leaderboard: {
    type: [
      {
        position: {
          type: Number,
          required: true,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        portfolio: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

module.exports = mongoose.model("Leaderboard", leaderBoardSchema);
