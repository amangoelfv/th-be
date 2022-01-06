const router = require("express").Router();
const Contest = require("../models/contest");

const currDate=new Date()

router.post("/create", async (req, res) => {
  try {
    // add error handling for missing fields
    const newContest = new Contest(req.body);
    const contest = await newContest.save();
    res.send(contest)
    res.status(200).json("Contest Created Successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

// get curr contests -> active & upcoming -> endDate:{$gte:currDate}

// active key to tell if contest is active
//startdate < currdate
// {
//   ...contest,
//      active: true
// } 

// get all contests -> if(contest.participants.find(user)) => userParticipated: true? false
// start <today & end > today
router.get('/active',async(req,res)=>{
  try{
   const activeContest=await Contest.find({endDate:{$gte:currDate}})
   res.status(200).json(activeContest)
  }catch(err){
    res.status(500).json(err);
  }
})

//get past contests
router.get('/past',async (req,res)=>{
  try{
  const pastContest=await Contest.find({endDate:{$lt:currDate}})
   res.status(200).json(pastContest)
  }catch(err){
    res.status(500).json(err);
  }
})

//register for contest
// contest -> participants mein insert user id orders array = []
// wallet amount = contest ki initial money


//getAllAssets


//contest.assets -> id -> redstone(id) -> symbol, name, token, cyrr price, pnl
//getAssetDetails
//createOrder
///getHistory
module.exports = router;
