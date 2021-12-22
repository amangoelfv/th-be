const router = require("express").Router();
const Contest = require("../models/contest");

const currDate=new Date()

router.post("/create", async (req, res) => {
  try {
    const newContest = new Contest(req.body);
    const contest = await newContest.save();
    res.send(contest)
    res.status(200).json("Contest Created Successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

//get active contests
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

module.exports = router;
