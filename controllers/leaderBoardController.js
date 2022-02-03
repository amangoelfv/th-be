const Contest = require("../models/contest");
const allowedSymbols = require("../utils/allowedSymbols.json");
const fetch = require("node-fetch");
const Leaderboard = require("../models/Leaderboard");

const calculateLeaderBoard = async (id, contestId) => {
  const symbols = Object.keys(allowedSymbols);
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/price");
    const data = await res.json();
    let prices = {};
    for (let symbol of data) {
      if (symbols.includes(symbol.symbol)) {
        prices[symbol.symbol] = Number(symbol.price);
      }
    }
    Contest.findOne({
      _id: contestId,
    }).then((contest) => {
      let allValues = [];
      for (let user of contest.participants) {
        if (user.order.length > 0) {
          let portfolio = Number(user.walletAmount);
          for (let holding of user.holdings) {
            portfolio += Number(
              Number(prices[holding.token]) * Number(holding.qty)
            );
          }
          allValues.push({
            user: user.user_id,
            portfolio: portfolio.toFixed(2),
            type: portfolio > contest.initialSum ? "profit" : "loss",
          });
        }
      }
      allValues = allValues.sort((a, b) => b.portfolio - a.portfolio);
      const res1 = allValues.slice(0, 9).map((i, ind) => {
        return {
          ...i,
          position: ind + 1,
        };
      });
      Leaderboard.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            leaderboard: [],
          },
          $set: {
            leaderboard: res1,
          },
        }
      ).then((d) => {
        console.log(d, res1);
      });
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = { calculateLeaderBoard };
