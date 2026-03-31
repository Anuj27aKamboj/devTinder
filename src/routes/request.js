const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middleware/userAuth");
const ConnectionRequest = require("../models/connectionRequest");

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req,res)=>{
    try{
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

//         console.log("fromUserId:", fromUserId);
// console.log("length:", fromUserId?.length);

        const alloweStatus = ["ignored", "interested"];
        if(!alloweStatus.includes(status)){
          return res.status(400).json({message:"Invalid status type "+ status})

        }

        const existingConnectionRequest = await ConnectionRequest.findOne({
          $or: [
            {fromUserId, toUserId},
            {fromUserId:toUserId, toUserId:fromUserId},
          ]
        });
        if(existingConnectionRequest){
          return res.status(400).json({message:"Connection Requestion already exists"})
        };

        const connectionRequest = new ConnectionRequest({
          fromUserId,
          toUserId,
          status,
        })

        const data = await connectionRequest.save();

        res.json({
          message: "Connection Request: "+status,
          data
        });
    }catch (err) {
    res.status(400).send("Uh oh! Something feels wrong: "+err.message);
  }
})

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req,res)=>{
    try{
      const loggedInUser = req.user;
        const {status,requestId} = req.params;

        const alloweStatus = ["accepted", "rejected"];
        if(!alloweStatus.includes(status)){
          return res.status(400).json({message:"Invalid status type "+ status})

        }

        const connectionRequest = await ConnectionRequest.findOne({
          _id:requestId,
          toUserId: loggedInUser._id,
          status: "interested",
        })
        if(!connectionRequest){
          return res.status(400).send("Invalid Connection Request")
        };

        connectionRequest.status = status

        const data = await connectionRequest.save();

        res.json({
          message: "Connection Request: "+status,
          data
        });
    }catch (err) {
    res.status(400).send("Uh oh! Something feels wrong: "+err.message);
  }
})


module.exports = requestRouter