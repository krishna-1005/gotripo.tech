const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
    index: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  clonedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Itinerary",
    default: null
  },
  days: [{
    date: { type: Date, required: true },
    events: [{
      time: { type: String, required: true },
      name: { type: String, required: true },
      description: { type: String },
      ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      status: { 
        type: String, 
        enum: ["confirmed", "pending", "cancelled"], 
        default: "pending" 
      },
      linkedPollId: { type: mongoose.Schema.Types.ObjectId, ref: "Poll" }
    }]
  }]
}, { timestamps: true });

module.exports = mongoose.model("Itinerary", itinerarySchema);
