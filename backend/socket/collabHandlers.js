const Message = require("../models/Message");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Trip = require("../models/Trip");
const { verifyTokenHelper } = require("../middleware/protect");

// Store online presence as a Map: tripId -> Set of userIds
const onlineUsers = new Map();

module.exports = (io) => {
  // 1. Authenticate Socket Connection on Handshake
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const user = await verifyTokenHelper(token);
      if (!user) {
        return next(new Error("Authentication error: Invalid or expired token"));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error("[SOCKET AUTH ERROR]", err.message);
      next(new Error("Authentication error: " + err.message));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[SOCKET] Authenticated user connected: ${socket.user.email} (${socket.id})`);

    // 2. Authorize joining room and prevent identity spoofing
    socket.on("join:room", async ({ tripId, userId }) => {
      if (!tripId || !userId) return;

      const cleanUserId = userId.toString();
      const authUserId = socket.user._id.toString();
      const authFirebaseUid = socket.user.firebaseUid;

      // Identity validation
      if (authUserId !== cleanUserId && authFirebaseUid !== cleanUserId) {
        console.warn(`[SECURITY WARNING] User ${authUserId} attempted to masquerade as ${cleanUserId}`);
        return;
      }

      try {
        // Membership validation
        const trip = await Trip.findById(tripId);
        if (!trip) {
          console.warn(`[SOCKET] Join room failed: Trip ${tripId} not found`);
          return;
        }

        const isMember = trip.userId.toString() === authUserId || 
                         trip.members.some(m => m.userId && m.userId.toString() === authUserId);

        if (!isMember) {
          console.warn(`[SECURITY WARNING] Unauthorized socket room join attempt. User: ${authUserId}, Trip: ${tripId}`);
          return;
        }

        // Successfully authorized
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
      } catch (err) {
        console.error("[SOCKET] Room join authorization error:", err.message);
      }
    });

    socket.on("leave:room", ({ tripId, userId }) => {
      if (!tripId || !userId) return;
      if (socket.tripId !== tripId) return;

      socket.leave(tripId);
      if (onlineUsers.has(tripId)) {
        onlineUsers.get(tripId).delete(userId);
        io.to(tripId).emit("user:offline", { userId });
      }
      console.log(`[SOCKET] User ${userId} left trip room ${tripId}`);
    });

    // 3. Secure actions by validating they match the socket's authorized tripId
    socket.on("message:send", async ({ tripId, senderId, text, userName, initials, color }) => {
      if (socket.tripId !== tripId) {
        console.warn(`[SECURITY WARNING] Blocked message send: Socket tripId ${socket.tripId} does not match target ${tripId}`);
        return;
      }

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
          
          offlineMembers.forEach(m => {
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
      if (socket.tripId !== tripId) return;
      io.to(tripId).emit("suggestion:receive", suggestion);
    });

    socket.on("suggestion:voted", ({ tripId, suggestionId, suggestion }) => {
      if (socket.tripId !== tripId) return;
      io.to(tripId).emit("suggestion:updated", { suggestionId, suggestion });
    });

    socket.on("itinerary:updated", ({ tripId, itinerary }) => {
      if (socket.tripId !== tripId) return;
      io.to(tripId).emit("itinerary:receive", itinerary);
    });

    socket.on("itinerary:activityAdded", ({ tripId, dayIndex, activity }) => {
      if (socket.tripId !== tripId) return;
      io.to(tripId).emit("itinerary:activityAdded", { dayIndex, activity });
    });

    socket.on("itinerary:activityMoved", ({ tripId, dayIndex, activities }) => {
      if (socket.tripId !== tripId) return;
      io.to(tripId).emit("itinerary:activityMoved", { dayIndex, activities });
    });

    socket.on("itinerary:activityDeleted", ({ tripId, dayIndex, activityId }) => {
      if (socket.tripId !== tripId) return;
      io.to(tripId).emit("itinerary:activityDeleted", { dayIndex, activityId });
    });

    socket.on("itinerary:aiRegenerated", ({ tripId, itinerary }) => {
      if (socket.tripId !== tripId) return;
      io.to(tripId).emit("itinerary:aiRegenerated", itinerary);
    });

    socket.on("member:typing", ({ tripId, userName, isTyping }) => {
      if (socket.tripId !== tripId) return;
      socket.to(tripId).emit("member:typing", { userName, isTyping });
    });

    socket.on("poll:vote", ({ tripId, poll }) => {
      if (socket.tripId !== tripId) return;
      io.to(tripId).emit("poll:updated", poll);
    });

    socket.on("activity:visitedToggle", ({ tripId, dayIndex, activityId, isVisited, visitedBy }) => {
      if (socket.tripId !== tripId) return;
      io.to(tripId).emit("activity:visited", { dayIndex, activityId, isVisited, visitedBy });
    });

    socket.on("guideme:note", ({ tripId, dayIndex, activityId, note }) => {
      if (socket.tripId !== tripId) return;
      io.to(tripId).emit("guideme:note", { dayIndex, activityId, note });
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
