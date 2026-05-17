const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // null means it's a global broadcast for all users
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "promo", "trip", "chat"],
      default: "info",
    },
    meta: {
      tripId: String,
      senderId: String,
      senderName: String
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      required: false,
    },
    expiresAt: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

// Index for faster lookups
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
