const { Server } = require("socket.io");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
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
  const io = new Server(server, { cors: corsOptions });

  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      console.log("Socket handshake cookies:", cookies);
      const token = cookies.token;

      if (!token) throw new Error("No token");

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.userId = decoded._id;
      next();
    } catch (err) {
      console.error("Socket auth failed:", err.message);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ targetUserId }) => {
      const roomId = getSecretRoomId(socket.userId, targetUserId);
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ targetUserId, text }) => {
      try {
        const userId = socket.userId;
        const roomId = getSecretRoomId(userId, targetUserId);

        const existingConnectionRequest = await connectionRequest.findOne({
          $or: [
            { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
            { fromUserId: targetUserId, toUserId: userId, status: "accepted" },
          ],
        });

        if (!existingConnectionRequest) {
          throw new Error(`No connection between ${userId} & ${targetUserId}`);
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

        chat.messages.push({ senderId: userId, text, status: "sent" });
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
        console.error("Socket error:", err.message);
        socket.emit("errorMessage", { message: err.message });
      }
    });

    socket.on("disconnect", () => {});
  });

  return io;
};

module.exports = initializeSocket;
