const mongoose = require("mongoose");
const User = require("./user");

const contestSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Contest title is required"],
		},
		organiser: {
			type: String,
			required: [true, "Organiser name is required"],
		},
		desc: {
			type: String,
			required: [true, "Contest description is required"],
		},
		startDate: {
			type: String,
			required: [true, "Contest timeline is required"],
		},
		endDate: {
			type: String,
			required: [true, "Contest timeline is required"],
		},
		coverImg: {
			type: String,
			required: [true, "Cover Image is required"],
		},
		initialSum: {
			type: Number,
			required: [true, "Amount is required"],
		},
		prizes: {
			type: [],
		},
		assets: {
			type: [String],
			required: [true, "Asset/s is/are required"],
		},
		leaderBoardId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Leaderboard",
		},
		// participants: {
		//   type: [{
		//     user_id: igdgi,
		//     walletAmount
		//     orders: [],
		//     holdings: []
		//   }]
		// }
		//userTokens: [{
		// email: akjh,
		// userToken: "87638"
		// }]
		userTokens: [
			{
				type: String,
				unique: true
			}
		],
		participants: [
			{
				user_id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
					unique: true,
				},
				walletAmount: {
					type: Number,
					required: true,
				},
				orders: {
					type: [],
					required: true,
				},
				portfolio: {
					type: Number,
					required: true
				},
				holdings: {
					type: [],
					required: true,
				},
				userToken: {
					type: String,
					required: true
				}
			},
		],
	},
	{
		timestamps: true,
	}
);


module.exports = mongoose.model("contest", contestSchema);
