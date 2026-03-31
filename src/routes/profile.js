const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/userAuth");
const { validateProfileData} = require("../utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");

profileRouter.get("/profile/view",userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("Uh oh! Something feels wrong: "+err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req,res) => {
   try{
    if(!validateProfileData(req)){
    throw new Error("Invalid Edit Request");
   }
   const loggedInUser = req.user;
  
   Object.keys(req.body).forEach(key => loggedInUser[key] = req.body[key])
   await loggedInUser.save();

   res.json({message : `${loggedInUser.firstName} updated profile`, data: loggedInUser})
   res.send()
  }catch (err) {
    res.status(400).send("Uh oh! Something feels wrong: "+err.message);
  }
})

profileRouter.patch("/profile/edit/password", userAuth, async (req,res) => {
   try{
    const {currentPassword, newPassword} = req.body;

    //Input validation
    if(!currentPassword || !newPassword){
      return res.status(400).send("All fields are required")
    }

    //Verify Current Password
    const isMatchingOldPassword = await req.user.validatePassword(currentPassword)
    // console.log(isMatchingOldPassword)
    if(!isMatchingOldPassword){
      return res.status(401).send("Current Password is incorrect")
    }

    //Prevent reuse of old password
    const isSamePassword = await req.user.validatePassword(newPassword)
    if(isSamePassword){
      return res.status(401).send("New Password cannot be same as old password")
    }
    // console.log(isSamePassword)

    //Validate strength of new password
    if(!validator.isStrongPassword(newPassword)){
      return res.status(401).send("Enter a strong password")
    }

    //Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    // console.log(passwordHash)
    req.user.password = passwordHash;

    await req.user.save()

    return res.send("Password Updated Successfully");

  }catch(err) {
    console.error(err)
    res.status(400).send("Uh oh! Something feels wrong: "+ err.message);
  }
})


module.exports = profileRouter