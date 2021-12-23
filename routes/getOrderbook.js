const router = require('express').Router();
const orderbook = require('../Models/OrderBook');

router.get('/orderbook', async(req, res, userId) => {
    try {
        const usersOrder = await orderbook.findOne({_id: userId})
        res.status(200).json(usersOrder);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;