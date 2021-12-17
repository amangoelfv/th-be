const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    organiser: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
    },
    coverImg: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("contest", contestSchema);
