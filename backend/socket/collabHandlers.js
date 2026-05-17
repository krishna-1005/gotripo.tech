const Message = require("../models/Message");
const User = require("../models/User");

// Store online presence as a Map: tripId -> Set of userIds
const onlineUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`[SOCKET] User connected: ${socket.id}`);

    socket.on("join:room", async ({ tripId, userId }) => {
      if (!tripId || !userId) return;

      socket.join(tripId);
      socket.tripId = tripId;
      socket.userId = userId;

      if (!onlineUsers.has(tripId)) {
        onlineUsers.set(tripId, new Set());
      }
      onlineUsers.get(tripId).add(userId);

      // Broadcast online status
      io.to(tripId).emit("user:online", { userId });
      
      console.log(`[SOCKET] User ${userId} joined trip room ${tripId}`);
    });

    socket.on("leave:room", ({ tripId, userId }) => {
      if (!tripId || !userId) return;

      socket.leave(tripId);
      if (onlineUsers.has(tripId)) {
        onlineUsers.get(tripId).delete(userId);
        io.to(tripId).emit("user:offline", { userId });
      }
      console.log(`[SOCKET] User ${userId} left trip room ${tripId}`);
    });

    socket.on("message:send", async ({ tripId, senderId, text, userName, initials, color }) => {
      try {
        // Broadcast the message instantly
        io.to(tripId).emit("message:receive", {
          userId: senderId,
          userName: userName || "Traveller",
          initials: initials || "?",
          text,
          color: color || "bg-primary",
          timestamp: new Date(),
          createdAt: new Date()
        });
      } catch (error) {
        console.error("Socket message error:", error);
      }
    });

    socket.on("suggestion:added", ({ tripId, suggestion }) => {
      io.to(tripId).emit("suggestion:receive", suggestion);
    });

    socket.on("suggestion:voted", ({ tripId, suggestionId, suggestion }) => {
      io.to(tripId).emit("suggestion:updated", { suggestionId, suggestion });
    });

    socket.on("itinerary:updated", ({ tripId, itinerary }) => {
      io.to(tripId).emit("itinerary:receive", itinerary);
    });

    socket.on("itinerary:activityAdded", ({ tripId, dayIndex, activity }) => {
      io.to(tripId).emit("itinerary:activityAdded", { dayIndex, activity });
    });

    socket.on("itinerary:activityMoved", ({ tripId, dayIndex, activities }) => {
      io.to(tripId).emit("itinerary:activityMoved", { dayIndex, activities });
    });

    socket.on("itinerary:activityDeleted", ({ tripId, dayIndex, activityId }) => {
      io.to(tripId).emit("itinerary:activityDeleted", { dayIndex, activityId });
    });

    socket.on("itinerary:aiRegenerated", ({ tripId, itinerary }) => {
      io.to(tripId).emit("itinerary:aiRegenerated", itinerary);
    });

    socket.on("member:typing", ({ tripId, userName, isTyping }) => {
      socket.to(tripId).emit("member:typing", { userName, isTyping });
    });

    socket.on("poll:vote", ({ tripId, poll }) => {
      // Broadcast updated poll data to the room
      io.to(tripId).emit("poll:updated", poll);
    });

    socket.on("disconnect", () => {
      if (socket.tripId && socket.userId) {
        if (onlineUsers.has(socket.tripId)) {
          onlineUsers.get(socket.tripId).delete(socket.userId);
          io.to(socket.tripId).emit("user:offline", { userId: socket.userId });
        }
      }
      console.log(`[SOCKET] User disconnected: ${socket.id}`);
    });
  });
};
