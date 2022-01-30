const router = require("express").Router();
const Contest = require("../models/contest");
const currDate = new Date();
const fetch = require("node-fetch");
const allowedSymbols = {
  BTCUSDT: {
    icon: "https://res.cloudinary.com/icellnitkkr/image/upload/v1643212359/assets-icons/btc-bitcoin_rtptep.png",
    name: "Bitcoin",
    token: "BTCUSDT",
    currPrice: 0,
    percentChange: 0,
  },
  BNBUSDT: {
    icon: "https://res.cloudinary.com/icellnitkkr/image/upload/v1643212922/assets-icons/bnb-binance-coin_qozs3z.png",
    name: "Binance Coin",
    token: "BNBUSDT",
    currPrice: 0,
    percentChange: 0,
  },
  ETHUSDT: {
    icon: "https://res.cloudinary.com/icellnitkkr/image/upload/v1643212359/assets-icons/eth-ethereum_c6jqsq.png",
    name: "Ethereum",
    token: "ETHUSDT",
    currPrice: 0,
    percentChange: 0,
  },
  ADAUSDT: {
    icon: "https://res.cloudinary.com/icellnitkkr/image/upload/v1643212359/assets-icons/ada-cardano_hnkupj.png",
    name: "Cardano",
    token: "ADAUSDT",
    currPrice: 0,
    percentChange: 0,
    decimalPoints: 5,
  },
  XRPUSDT: {
    icon: "https://res.cloudinary.com/icellnitkkr/image/upload/v1643212359/assets-icons/xrp-xrp_idhvqc.png",
    name: "XRP",
    token: "XRPUSDT",
    currPrice: 0,
    percentChange: 0,
    decimalPoints: 5,
  },
  SOLUSDT: {
    icon: "https://res.cloudinary.com/icellnitkkr/image/upload/v1643212359/assets-icons/sol-solana_zz1iti.png",
    name: "Solana",
    token: "SOLUSDT",
    currPrice: 0,
    percentChange: 0,
  },
  LUNAUSDT: {
    icon: "https://res.cloudinary.com/icellnitkkr/image/upload/v1643212359/assets-icons/luna-terra_znp0ds.png",
    name: "Terra",
    token: "LUNAUSDT",
    currPrice: 0,
    percentChange: 0,
  },
  DOGEUSDT: {
    icon: "https://res.cloudinary.com/icellnitkkr/image/upload/v1643212359/assets-icons/doge-dogecoin_utp808.png",
    name: "Dogecoin",
    token: "DOGEUSDT",
    currPrice: 0,
    percentChange: 0,
    decimalPoints: 5,
  },
  AVAXUSDT: {
    icon: "https://res.cloudinary.com/icellnitkkr/image/upload/v1643212360/assets-icons/avax-avalanche_eujqut.png",
    name: "Avalanche",
    token: "AVAXUSDT",
    currPrice: 0,
    percentChange: 0,
  },
  DOTUSDT: {
    icon: "https://res.cloudinary.com/icellnitkkr/image/upload/v1643212359/assets-icons/dot-polkadot_ymyu1w.png",
    name: "Polkadot",
    token: "DOTUSDT",
    currPrice: 0,
    percentChange: 0,
  },
  MATICUSDT: {
    icon: "https://res.cloudinary.com/icellnitkkr/image/upload/v1643212359/assets-icons/matic-polygon_gosz18.png",
    name: "Polygon",
    token: "MATICUSDT",
    currPrice: 0,
    percentChange: 0,
    decimalPoints: 5,
  },
  SHIBUSDT: {
    icon: "https://res.cloudinary.com/icellnitkkr/image/upload/v1643212360/assets-icons/shib-shiba-inu_vldoev.png",
    name: "Shiba Inu",
    token: "SHIBUSDT",
    currPrice: 0,
    percentChange: 0,
    decimalPoints: 8,
  },
};
router.post("/create", async (req, res) => {
  try {
    // add error handling for missing fields <--DONE
    const newContest = new Contest(req.body);
    await newContest.save();

    res.status(200).json({
      message: "Contest Created Successfully",
      data: { newContest },
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
  console.log("hi");
  const { user } = req;
  const currDate = new Date();
  try {
    const contests = await Contest.find({ endDate: { $gte: currDate } });
    res.status(200).send({
      success: true,
      data: contests.map((contest) => {
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
          active: startDate <= currDate,
          registered: participants.findIndex(
            (participant) => participant.user_id == user.id
          )
            ? true
            : false,
        };
      }),
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// get all contests -> if(contest.participants.find(user)) => userParticipated: true? false

//get past contests
router.get("/past", async (req, res) => {
  try {
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
            change: ((portfolio - initialSum) / 100).toFixed(2),
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
        console.log(data.participants.findIndex((p) => p.user_d == user.id));
        return res
          .status(404)
          .send({ success: false, err: "User already registered" });
      }
      Contest.findOneAndUpdate(
        { _id: contestId },
        {
          $pull: {
            userTokens: {
              $in: [inviteCode],
            },
          },
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
    // Contest.findOne({ _id: contestId }).then((cc) => {
    //   cc.participants.find((user) => user.user_id.toString() === req.user.id)
    //   .then((data) => {
    //     data.findOneAndUpdate(
    //       { token: token },
    //       { $set: { "holdings.$[elem].qty": holding.qty } },
    //       { arrayFilters: [{ "elem.token": { $eq: token } }] }
    //     )
    //   });
    // })
    if (qty * rate < 1) {
      return res.status(400).send({
        success: false,
        message: "The minimum deal should be of $1.",
      });
    }
    if (holding.qty.toFixed(5) == 0) {
      console.log("making empty");
      const newHoldings = Seller.holdings.filter((i) => i.token != token);
      const newWalletAmt = Seller.walletAmount + qty * rate;
      Contest.updateOne(
        { _id: contestId },
        {
          $set: {
            "participants.$[user].holdings": newHoldings,
            "participants.$[user].walletAmount": newWalletAmt,
          },
        },
        {
          multi: false,
          arrayFilters: [
            {
              "user.user_id": { $eq: req.user.id },
            },
          ],
        }
      ).then((d) => console.log("s", d));
    } else {
      const newWalletAmt = Seller.walletAmount + qty * rate;
      console.log("hello");
      Contest.updateOne(
        { _id: contestId },
        {
          $set: {
            "participants.$[user].holdings": newHoldings,
            "participants.$[user].walletAmount": newWalletAmt,
          },
        },
        {
          multi: false,
          arrayFilters: [
            {
              "user.user_id": { $eq: req.user.id },
            },
          ],
        }
      ).then((d) => console.log("s", d));
    }

    // await contest.save();
    res.status(200).json({ message: "Order sold successfully" });
  } catch (err) {
    res.status(500).json(err.message);
  }
  //qty*rate add to wallet
  //decrease holdings by qty
});

router.get("/buyrequest", async (req, res) => {
  const qty = req.body.qty;
  const rate = req.body.rate;
  const token = req.body.token;
  const userId = req.user.id;
  
  try {
    const buy_data = await Contest.find({ _id: req.body.contestId })
    .participants.findOne((user) => {
      user.user_id.toString() == userId;
    })

    const buyholdings = buy_data.holdings;

    buyholdings.find((holding) => {
      if(holding.token == token){
        if (qty * rate >= buy_data.walletAmount) {
          buy_data.walletAmount = buy_data.walletAmount - qty * rate;
          holding.qty -= qty;
        }
        else{
          return res.status(400).json({ message: "Invalid Request" });
        }
      }
    })

    await buy_data.save();
    res.status(200).json(buy_data);
  } catch (err) {
    res.status(500).json(err);
  }

})

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

function updateCache(){
  fetch('https://cryptocurrencyliveprices.com/api/', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      symbol: coin_symbol,
      name: coin_name,
      daychange: coin_percent_change_7d, 
      currprice: coin_price_usd*70 // convert to inr
    })
  })
}

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
