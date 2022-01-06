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
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    coverImg: {
      type: String,
      required: true,
    },
    initialSum: {
      type: Number,
      required: true
    },
    prizes: {
      type: []
    },
    assets: {
      type: [String],
      required: true
    },
    // participants: {
    //   type: [{
    //     user_id: igdgi,
    //     walletAmount
    //     orders: [],
    //     holdings: []
    //   }]
    // }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("contest", contestSchema);
