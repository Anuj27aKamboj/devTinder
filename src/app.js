const express = require("express");
const connectDb = require("./config/database");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "http://3.26.43.77",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDb()
  .then(() => {
    console.log("Database connection is successful");
    app.listen(7777, () => {
      console.log("Server is successfully listening on port 7777");
    });
  })
  .catch((err) => {
    console.error("Uh Oh! Database cannot be connected");
  });
