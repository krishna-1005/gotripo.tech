const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  // Who submitted (optional - anonymous feedback allowed)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  name: { type: String, default: "Anonymous" },
  email: { type: String, default: "" },

  // Core feedback questions
  isUseful: { 
    type: String, 
    enum: ["very_useful", "useful", "neutral", "not_useful", "not_at_all"],
    required: true 
  },
  willUseAgain: { 
    type: String, 
    enum: ["definitely", "probably", "not_sure", "probably_not", "no"],
    required: true 
  },
  willRecommend: { 
    type: String, 
    enum: ["definitely", "probably", "not_sure", "probably_not", "no"],
    required: true 
  },
  
  // Overall rating (1-5 stars)
  overallRating: { type: Number, min: 1, max: 5, required: true },

  // Open-ended improvement suggestions
  improvements: { type: String, default: "" },
  
  // What features they liked most
  favoriteFeature: { type: String, default: "" },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Feedback", feedbackSchema);
