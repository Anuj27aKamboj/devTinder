const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Invalid Token");
    }

    let decodedObj;
    try {
      decodedObj = jwt.verify(token, "DEV@TINDER$123");
    } catch {
      throw new Error("Invalid or expired token");
    }
    const { _id } = decodedObj;

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("Uh oh! Something feels wrong" + err.message);
  }
};

module.exports = {
  userAuth,
};
