const mongoose = require("mongoose");

const leaderBoardSchema = new mongoose.Schema(
    {
        currentRank: {
            type: Number,
            required: true
        },
        Leaderboard: {
            position: {
                type: Number,
                required: true
            },
            User: {
                name: {
                    type: Number,
                    required: true
                },
                user_id: {
                    type: String,
                    required: true,
                    unique: true
                },
                username: {
                    type: String,
                    required: true
                }
            }
        }
    }
);

module.exports = mongoose.model("Leaderboard", leaderBoardSchema);