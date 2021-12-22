const express = require("express");
const app = express();
const port = 3000;
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const contestRouter = require("./routes/contests");
const notifs=require("./routes/notifs")
dotenv.config();
const bodyParser = require("body-parser");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("connected to db"))
  .catch((err) =>
    console.log("unable to conect to db because of error: ", err)
  );

app.use(bodyParser.json());

app.use(express.json());
app.use("/contests", contestRouter);
app.get("/", (req, res) => {
  res.send("Welcome to Trade Hunt");
});
app.use("/news",notifs);

app.listen(port, () => {
  console.log(`Tradehunt Backend is running at http://localhost:${port}`);
});
