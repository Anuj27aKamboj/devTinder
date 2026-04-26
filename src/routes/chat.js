const express = require("express");
const { userAuth } = require("../middleware/userAuth");
const Chat = require("../models/chat");
const { USER_SAFE_DATA } = require("../utils/contants");
const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    })
      .populate("messages.senderId", "firstName lastName photoURL")
      .select({
        messages: { $slice: -10 }, // last 10 messages
      });

    if (!chat) {
      return res.json({
        message: "No chat yet",
        chat: { messages: [] },
      });
    }
    res.json({
      message: "Chat fetched successfully",
      chat,
    });
  } catch (err) {
    res
      .status(400)
      .send({ message: "Uh oh! Something feels wrong: " + err.message });
  }
});

module.exports = chatRouter;
