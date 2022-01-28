const router = require("express").Router();
const Contest = require("../models/contest");
const redstone = require("redstone-api");
const currDate = new Date();

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
router.get("/active", async (req, res) => {
  try {
    const currContest = await Contest.find({ endDate: { $gte: currDate } });
    // active key to tell if contest is active
    //startdate < currdate
    // {
    //   ...contest,
    //      active: true
    // }
    if (currContest.startDate <= currDate) {
      currContest = { ...currContest, active: true };
    } else currContest = { ...currContest, active: false };

    res.status(200).send(currContest);
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
//contest.assets -> id -> redstone(id) -> symbol, name, token, cyrr price, pnl


router.get("/test", async (req, res) => {
  try {
    const symbols = ["AR", "BTC", "UNI", "ETH", "EUR"];
    const x = await redstone.getHistoricalPrice(symbols, {
      date: Date.now(), // Any convertable to date type
    });
    return res.send({
      data: x,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

//getAllAssets
// array of allowed assets 
// getCurrentPrice
//getAssetDetails

//createOrder
///getHistory


router.post('/registerForContest', (req, res) => {
  console.log(req)
  const { user } = req
  console.log(user)
  const { inviteCode, contestId } = req.body
  try {
    Contest.findOne({ _id: contestId, userTokens: { $in: [inviteCode] }, startDate: { $lte: new Date() }, endDate: { $gte: new Date() } }).then(data => {
      if (!data)
        return res.status(404).send('Contest not found!')
      Contest.findOneAndUpdate({ _id: contestId }, {
        $pull: {
          userTokens: {
            $in: [inviteCode]
          }
        },
        $push: {
          participants:
          {
            user_id: user.id,
            walletAmount: data.initialSum,
            orders: [],
            portfolio: 0,
            holdings: [],
            userToken: inviteCode
          }
        }
      }).then(data => {
        res.send("Registered Successfully!")
      })
    })
  }
  catch (e) {
    console.log(e)
    res.status(500).send(e)
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