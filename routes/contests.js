const router = require("express").Router();
const Contest = require("../models/contest");

router.post("/create", async (req, res) => {
  try {
    const newContest = new Contest(req.body);
    const contest = await newContest.save();
    res.status(200).json("Contest Created Successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
