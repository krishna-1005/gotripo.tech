const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  // Advanced Poll Fields (from pollRoutes.js)
  pollId: { 
    type: String, 
    unique: true, 
    sparse: true,
    index: true
  },
  tripName: { type: String }, // Acts as the title/question in some contexts
  groupSize: { type: Number },
  totalMembers: { type: Number, default: 1 },
  isClosed: { type: Boolean, default: false },
  winner: { type: String },
  voters: [{ // Participant tracking
    userId: { type: String }, // Can be firebaseUid or anon ID
    name: { type: String },
    votedAt: { type: Date, default: Date.now }
  }],

  // Core Poll Fields (from polls.js / original model)
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
    index: true
  },
  question: { 
    type: String, 
    required: true,
    default: function() { return this.tripName || "Untitled Poll"; }
  },
  options: [{
    // Unified option fields
    name: { type: String }, // Advanced
    text: { type: String, required: true, default: function() { return this.name || ""; } }, // Original
    city: { type: String },
    tags: [String],
    vibe: { type: String },
    votes: { type: Number, default: 0 }, // Advanced (count)
    voterIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // Original (references)
  }],
  linkedEventId: { type: mongoose.Schema.Types.ObjectId }, 
  status: { 
    type: String, 
    enum: ["open", "closed"], 
    default: "open" 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Sync status and isClosed before saving
pollSchema.pre('save', function() {
  if (this.isClosed) this.status = 'closed';
  if (this.status === 'closed') this.isClosed = true;
});

module.exports = mongoose.models.Poll || mongoose.model("Poll", pollSchema);
