const router = require("express").Router();
const Contest = require("../models/contest");
const fetch = require("node-fetch");
const Leaderboard = require("../models/Leaderboard");
const {
  calculateLeaderBoard,
} = require("../controllers/leaderBoardController");
const allowedSymbols = require("../utils/allowedSymbols.json");

router.post("/create", async (req, res) => {
  try {
    //  add error handling for missing fields <--DONE
    await Contest.insertMany([req.body]).then((contest) => {
      Leaderboard.insertMany([
        {
          contestId: contest[0]._id,
          leaderboard: [],
        },
      ]).then((data) => {
        console.log(data);
        Contest.findByIdAndUpdate(contest[0]._id, {
          leaderboardId: data[0]._id,
        }).then((data1) => {
          console.log(data1);
        });
      });
    });
    res.status(200).json({
      message: "Contest Created Successfully",
      data: { Contest },
    });
  } catch (err) {
    res.status(err.status || 500).json({
      error: {
        name: err.name,
        message: err.message || "Internal Server Error",
      },
    });
  }
});

// get curr contests -> active & upcoming -> endDate:{$gte:currDate}
router.get("/getActiveAndUpcomingContests", async (req, res) => {
  const { user } = req;
  const currDate = new Date();
  try {
    const contests = await Contest.find({
      endDate: { $gte: currDate },
    });
    const data = contests.map((contest) => {
      const {
        _id,
        title,
        organiser,
        startDate,
        endDate,
        coverImg,
        participants,
        desc,
        prizes,
        initialSum,
        leaderboardId,
      } = contest;
      return {
        _id,
        title,
        organiser,
        startDate,
        endDate,
        coverImg,
        desc,
        prizes,
        initialSum,
        leaderboardId,
        promotion: contest._doc.promotion,
        active: startDate <= currDate,
        users: participants.length,
        registered:
          participants.findIndex(
            (participant) => participant.user_id == user.id
          ) >= 0
            ? true
            : false,
      };
    });
    res.status(200).send({
      success: true,
      data,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Unable to fetch contests" });
  }
});

// get all contests -> if(contest.participants.find(user)) => userParticipated: true? false

//get past contests
router.get("/past", async (req, res) => {
  try {
    const currDate = new Date();
    const pastContest = await Contest.find({ endDate: { $lt: currDate } });
    res.status(200).json(pastContest);
  } catch (err) {
    res.status(500).json(err);
  }
});

//register for contest
// contest -> participants mein insert user id orders array = []
// wallet amount = contest ki initial money

//getAllAssets
//getAllAssets
// array of allowed assets
// getCurrentPrice
//getAssetDetails

//createOrder
///getHistory

router.get("/getOrderHistory/:contestId", async (req, res) => {
  const { user } = req;
  const { contestId } = req.params;
  try {
    Contest.findOne({ _id: contestId }).then((contest) => {
      const userObj = contest.participants.find((u) => u.user_id == user.id);
      res.status(200).send({
        success: true,
        history: userObj.orders,
      });
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      error: e,
    });
  }
});

router.get("/getHoldings/:contestId", async (req, res) => {
  const { user } = req;
  const { contestId } = req.params;
  try {
    Contest.findOne({ _id: contestId }).then((contest) => {
      const userObj = contest.participants.find((u) => u.user_id == user.id);
      res.status(200).send({
        success: true,
        holdings: userObj.holdings,
        walletAmount: userObj.walletAmount,
      });
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      error: e,
    });
  }
});

router.get("/getAssetDetails/:contestId/:token", async (req, res) => {
  const { user } = req;
  const { contestId, token } = req.params;
  console.log(token, contestId, user);
  try {
    Contest.findOne({ _id: contestId }).then((contest) => {
      const userObj = contest.participants.find(
        (usr) => usr.user_id == user.id
      );
      const walletAmount = userObj.walletAmount;
      const holdings = userObj.holdings.find(
        (holding) => holding.token == token
      );
      res.status(200).send({
        success: true,
        data: {
          holdings,
          walletAmount,
        },
      });
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      error: e,
    });
  }
});
router.get("/getUserPortfolio/:contestId", async (req, res) => {
  const { user } = req;
  const { contestId } = req.params;
  const symbols = Object.keys(allowedSymbols);
  try {
    fetch("https://api.binance.com/api/v3/ticker/price")
      .then((res) => res.json())
      .then((d) => {
        let prices = {};
        for (let symbol of d) {
          if (symbols.includes(symbol.symbol)) {
            prices[symbol.symbol] = Number(symbol.price);
          }
        }
        Contest.findOne({
          _id: contestId,
        }).then((contest) => {
          const initialSum = contest.initialSum;
          const userObj = contest.participants.find(
            (u) => u.user_id == user.id
          );
          const { walletAmount, holdings } = userObj;
          let portfolio = walletAmount;
          for (const holding of holdings) {
            portfolio += prices[holding.token] * holding.qty;
          }
          res.status(200).send({
            portfolio,
            walletAmount,
            success: true,
            change: (((portfolio - initialSum) * 100) / initialSum).toFixed(2),
          });
        });
      });
  } catch (e) {
    res.status(500).send({
      success: false,
      error: e,
    });
  }
});

router.post("/registerForContest", (req, res) => {
  const { user } = req;
  const { inviteCode, contestId } = req.body;
  try {
    Contest.findOne({
      _id: contestId,
      userTokens: { $in: [inviteCode] },
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).then((data, rs) => {
      if (!data) {
        return res
          .status(404)
          .send({ success: false, err: "Invalid invite code" });
      }
      if (data.participants.findIndex((p) => p.user_d == user.id) >= 0) {
        return res
          .status(404)
          .send({ success: false, err: "User already registered" });
      }
      Contest.findOneAndUpdate(
        { _id: contestId },
        {
          $push: {
            participants: {
              user_id: user.id,
              walletAmount: data.initialSum,
              orders: [],
              portfolio: data.initialSum,
              holdings: [],
              userToken: inviteCode,
            },
          },
        }
      ).then((data) => {
        res.send({ message: "Registered Successfully!", success: true });
      });
    });
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

router.post("/sellOrder", async (req, res) => {
  const { qty, token, rate, contestId } = req.body;
  console.log(qty, token, rate, contestId);
  try {
    if (!qty || !token || !rate)
      return res
        .status(400)
        .json({ success: false, message: "Missing Parameters" });
    const contest = await Contest.findOne({ _id: contestId });
    const Seller = contest.participants.find(
      (user) => user.user_id == req.user.id
    );
    const holding = Seller.holdings.find((holding) => holding.token === token);
    if (!holding) {
      return res
        .status(400)
        .json({ success: false, message: "Holding does not exist" });
    }
    if (qty > holding.qty) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough quantity available" });
    }
    holding.qty -= qty;
    const newHoldings = Seller.holdings.map((i) => {
      if (i.token == token) {
        return {
          qty: holding.qty,
          token,
        };
      } else return i;
    });
    if (qty * rate < 1) {
      return res.status(400).send({
        success: false,
        message: "The minimum deal should be of $1.",
      });
    }
    const newWalletAmt = Seller.walletAmount + qty * rate;
    console.log(holding);
    if (holding.qty.toFixed(5) == 0) {
      Contest.findOneAndUpdate(
        { _id: contestId, "participants.user_id": req.user.id },
        {
          $pull: {
            "participants.$.holdings": {
              token: token,
            },
          },
          $set: {
            "participants.$.walletAmount": newWalletAmt,
          },
          $push: {
            "participants.$.orders": {
              token: token,
              qty,
              rate,
              type: "sell",
              time: new Date(),
            },
          },
        }
      ).then((data) => {
        console.log(data);
      });
    } else {
      Contest.findOneAndUpdate(
        { _id: contestId, "participants.user_id": req.user.id },
        {
          $set: {
            "participants.$.holdings": newHoldings,
            "participants.$.walletAmount": newWalletAmt,
          },
          $push: {
            "participants.$.orders": {
              token: token,
              qty,
              rate,
              type: "sell",
              time: new Date(),
            },
          },
        }
      ).then((data) => {
        console.log(data);
      });
    }

    // await contest.save();
    res.status(200).json({ success: true, message: "Order sold successfully" });
  } catch (err) {
    res.status(500).json(err.message);
  }
  //qty*rate add to wallet
  //decrease holdings by qty
});

router.post("/buyOrder", async (req, res) => {
  const { qty, token, rate, contestId } = req.body;
  console.log(qty, token, rate, contestId);
  try {
    if (!qty || !token || !rate)
      return res
        .status(400)
        .json({ success: false, message: "Missing Parameters" });
    const contest = await Contest.findOne({ _id: contestId });
    const Seller = contest.participants.find(
      (user) => user.user_id == req.user.id
    );
    var holding = Seller.holdings.find((holding) => holding.token === token);
    if (qty * rate > Seller.walletAmount) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough amount in wallet" });
    }
    var newHoldings = Seller.holdings.map((i) => {
      if (i.token == token) {
        return {
          qty: Number(Number(holding.qty) + Number(qty)),
          token,
        };
      } else return i;
    });
    if (!holding) {
      newHoldings.push({
        qty,
        token,
      });
    }
    if (qty * rate < 1) {
      return res.status(400).send({
        success: false,
        message: "The minimum deal should be of $1.",
      });
    }
    const newWalletAmt = Seller.walletAmount - qty * rate;
    console.log(newWalletAmt, newHoldings, req.user.id);
    Contest.findOneAndUpdate(
      { _id: contestId, "participants.user_id": req.user.id },
      {
        $set: {
          "participants.$.holdings": newHoldings,
          "participants.$.walletAmount": newWalletAmt,
        },
        $push: {
          "participants.$.orders": {
            token: token,
            qty,
            rate,
            type: "buy",
            time: new Date(),
          },
        },
      }
    ).then((data) => {
      console.log(data);
    });

    // await contest.save();
    res
      .status(200)
      .json({ success: true, message: token + " bought successfully" });
  } catch (err) {
    res.status(500).json(err.message);
  }
  //qty*rate add to wallet
  //decrease holdings by qty
});

router.get("/getPastLeaderboard/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const contest = await Leaderboard.findOne({ _id: id })
      .populate({
        path: "leaderboard",
        populate: {
          path: "user",
          select: "name username profileAvatar",
        },
      })
      .populate("contestId", "initialSum");
    res.status(200).json({ success: true, data: contest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get("/getLeaderboard/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let data = await Leaderboard.findOne({ _id: id });
    console.log(data.updatedAt, new Date());
    if (data.updatedAt.getTime() < new Date().getTime() - 1000 * 60 * 15) {
      await calculateLeaderBoard(id, data.contestId);
      data = await Leaderboard.findOne({ _id: id })
        .populate({
          path: "leaderboard",
          populate: {
            path: "user",
            select: "name username profileAvatar",
          },
        })
        .populate("contestId", "initialSum");
    } else {
      data = await Leaderboard.findOne({ _id: id })
        .populate({
          path: "leaderboard",
          populate: {
            path: "user",
            select: "name username profileAvatar",
          },
        })
        .populate("contestId", "initialSum");
    }
    res.status(200).send({ success: true, data });
  } catch (err) {
    console.log(err);
    res.status(500).send({ success: false, message: "cant get leaderboard" });
  }
});

router.get("/getPastContests", (req, res) => {
  Contest.find({
    endDate: { $lte: new Date() },
    startDate: { $lte: new Date() },
  })
    .then((data) => {
      res.send({ success: true, data });
    })
    .catch((err) => {
      res.send({ success: false, err });
    });
});

module.exports = router;

// assets_cache = {
//   data: [
//     {
//       symbol, name, daychange, currprice, 24hr,
//     }
//   ],
//   timestamp:
// }

// updateCache() {
//   feth('https://cryptocurrencyliveprices.com/api/').
//   //// {
//   symbol, name, daychange, currprice // convert to inr
//   }
// }

// function updateCache() {
//   fetch('https://cryptocurrencyliveprices.com/api/', {
//     method: 'POST',
//     headers: {
//       Accept: "application/json",
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       symbol: coin_symbol,
//       name: coin_name,
//       daychange: coin_percent_change_7d,
//       currprice: coin_price_usd * 70 // convert to inr
//     })
//   })
// }

// function getAllAssets(contestId) {
//   if (!assets_cache.data || timestamp is older than 15 minutes) {
//     await cache.updateChache();

//   }
//   return assets_cache.data;
// }

// function getAssetDetails()

//registerForContest = (inviteCode, contestId) {
// token.mail;
// contestId -> inviteTokens -> $in(token.mail[inviteCode])
// userTokens -> user ka corresponding token
// contest -> particpants -> initialize new participant
// user -> contests -> contest.id push
// }

// getAllContests =() => {
// active & upcoming
// constest start end date
// const userCOntest
//   all contests ->
//   registered: true,
//   participnts -> user.exists
// img, name, organisaer, startTime, endTime, registered
// }
