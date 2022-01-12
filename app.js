const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

//routes
const userRouter=require("./routes/userRoutes");
const contestRouter = require("./routes/contests");
const notifs=require("./routes/notifs")
const leaderboard = require('./routes/getLeaderboard');
const orderbook = require('./routes/getOrderbook');
const portfolio = require("./routes/getPortfolio");

//middlewares
const auth = require("./middleware/auth");

const port = 3000;
dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("connected to db"))
  .catch((err) =>
    console.log("unable to conect to db because of error: ", err)
  );

app.use(bodyParser.json());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Welcome to Trade Hunt");
});

app.use('/user', userRouter);
app.use("/contests", contestRouter);
app.use('/leaderboard', leaderboard);
app.use('/orderbook', orderbook);
app.use('/portfolio', portfolio);
app.use("/news",auth,notifs);

app.listen(port, () => {
  console.log(`Tradehunt Backend is running at http://localhost:${port}`);
});
