import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

const userLastSeenMap = {}; // {userId: lastSeenTimestamp}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;

    if (userLastSeenMap[userId]) {
      delete userLastSeenMap[userId];
    }
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  io.emit("getLastSeen", userLastSeenMap);

  socket.on("disconnect", () => {
    const userId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );

    console.log("A user disconnected", socket.id);

    if (userId) userLastSeenMap[userId] = new Date().toISOString();

    console.log(userLastSeenMap, "userLastSeenMap");

    delete userSocketMap[userId];

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    io.emit("getLastSeen", userLastSeenMap);
  });
});

export { io, app, server };
