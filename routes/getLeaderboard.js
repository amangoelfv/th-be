const router = require('express').Router();
const leaderboard = require('../Models/Leaderboard');

router.post('/leaderboard', async(req, res) => {
    try {
        const newContestant = new leaderboard(req.body);
        const contestant = await newContestant.save();
        res.send(contestant);
        res.status(200).json('New Contestant added to leaderboard.');
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get('/leaderboard', async(req, res) => {
    try {
        const userStandings = leaderboard.findMany({});
        res.status(200).json(userStandings);
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;