const router = require('express').Router();
const portfolio = require('../Models/Portfolio');

//userId, //contestId
// for every order -> 
router.get('/portfolio', async(req, res, userid) => {
    try {
        const userPortfolio = await portfolio.findOne({userId: userid});
        res.status(200).json(userPortfolio);
    } catch (err) {
        res.status(500).json(err);
    }
})

module.exports = router;