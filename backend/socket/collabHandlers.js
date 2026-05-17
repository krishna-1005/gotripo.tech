const Message = require("../models/Message");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Trip = require("../models/Trip");

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
        const payload = {
          userId: senderId,
          userName: userName || "Traveller",
          initials: initials || "?",
          text,
          color: color || "bg-primary",
          timestamp: new Date(),
          createdAt: new Date()
        };

        // Broadcast the message instantly
        io.to(tripId).emit("message:receive", payload);

        // Handle notifications for offline/inactive users
        const trip = await Trip.findById(tripId).populate('members.userId');
        if (!trip) return;

        const onlineSet = onlineUsers.get(tripId) || new Set();
        
        // Identify members who are NOT currently in the room
        const offlineMembers = trip.members.filter(m => 
          m.userId && 
          m.userId._id.toString() !== senderId && 
          !onlineSet.has(m.userId._id.toString())
        );

        if (offlineMembers.length > 0) {
          const notifications = offlineMembers.map(m => ({
            userId: m.userId._id,
            title: `New message in ${trip.title || 'Trip Room'}`,
            message: `${userName || 'A teammate'}: ${text.length > 50 ? text.substring(0, 47) + '...' : text}`,
            type: 'chat',
            link: `/collaborate/${tripId}`,
            meta: {
              tripId,
              senderId,
              senderName: userName || "Teammate"
            }
          }));

          await Notification.insertMany(notifications);
          
          // Optionally emit to those users if they are connected to other rooms or general socket
          offlineMembers.forEach(m => {
            // We'd need a way to find the user's general socket ID if they are elsewhere on the site
            // For now, they'll see it when the NotificationBell polls or via Browser Notifications if we add a global event
            io.emit(`user:notification:${m.userId._id}`, {
              type: 'chat',
              tripId,
              senderName: userName,
              text
            });
          });
        }
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
