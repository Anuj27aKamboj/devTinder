const { Server } = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");
const connectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("&&"))
    .digest("hex");
};

const initializeSocket = (server, corsOptions) => {
  const io = new Server(server, {
    cors: corsOptions,
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " Joined room:", roomId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, userId, targetUserId, text }) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId);

          const existingConnectionRequest = await connectionRequest.findOne({
            $or: [
              {
                fromUserId: userId,
                toUserId: targetUserId,
                status: "accepted",
              },
              {
                fromUserId: targetUserId,
                toUserId: userId,
                status: "accepted",
              },
            ],
          });

          if (!existingConnectionRequest) {
            throw new Error(
              `${userId} & ${targetUserId} don't have a connection`,
            );
          }

          const sender = await User.findById(userId).select(
            "firstName lastName photoURL",
          );

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId].sort(),
              messages: [],
            });
          }

          const newMessage = {
            senderId: userId,
            text,
            status: "sent",
          };

          chat.messages.push(newMessage);
          await chat.save();
          
          io.to(roomId).emit("messageReceived", {
            senderId: sender._id,
            firstName: sender.firstName,
            lastName: sender.lastName,
            photoURL: sender.photoURL,
            text,
            status: "sent",
            createdAt: new Date(),
          });
        } catch (err) {
          console.error("Uh oh! Something feels wrong: " + err.message);
          socket.emit("errorMessage", { message: err.message });
        }
      },
    );

    socket.on("disconnect", () => {
      //   console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

module.exports = initializeSocket;
