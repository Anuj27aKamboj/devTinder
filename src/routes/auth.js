const express = require("express");
const User = require("../models/user");
const {
  validateSignUpData,
  validateLogInData,
} = require("../utils/validation");
const bcrypt = require("bcrypt");

const authRouter = express.Router();

const isProduction = process.env.NODE_ENV === "production";

authRouter.post("/signup", async (req, res) => {
  //Creating a new instance of user model
  // const user = new User({
  //     firstName: "Amir",
  //     lastName: "Khan",
  //     emailId: "amir@khan.com",
  //     password: "amir@123"
  // });

  try {
    validateSignUpData(req); //validation
    const { firstName, lastName, emailId, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10); //encryption;
    // console.log(passwordHash);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    await user.save();

    const token = await user.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: isProduction,
      sameSite:"Lax",
    });

    res.status(201).json({
      message: "User created successfully",
      user: user.getSafeData(),
    });
  } catch (err) {
    res.status(400).send("Uh oh! Something feels wrong: " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    validateLogInData(req);
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    // console.log(user);

    if (!user) {
      throw new Error("User not found");
    }
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      //Create JWT token
      const token = await user.getJWT();

      //Add token to the cookie and send response back to the user
      res.cookie("token", token, {
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: isProduction,
      sameSite:"Lax",
    });

      // user = user.select(USER_SAFE_DATA);
      res.json({
        message: "Login Successful",
        user: user.getSafeData(),
      });
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res
      .status(401)
      .json({ message: "Uh oh! Something feels wrong: " + err.message });
  }
});

authRouter.post("/logout", async (req, res) => {
  res.clearCookie("token");
  res.send("Logout Successful");
});

module.exports = authRouter;
