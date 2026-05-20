const mongoose = require("mongoose");

const GeneratedContentSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true,
    enum: ["Instagram", "YouTube Shorts", "Twitter/X", "LinkedIn"],
  },
  contentType: {
    type: String,
    required: true,
    enum: ["Reel", "Carousel", "Story", "Tweet", "Ad Creative"],
  },
  tone: {
    type: String,
    required: true,
    enum: ["Viral", "Luxury", "Emotional", "Adventure", "Minimal"],
  },
  videoDuration: {
    type: String,
    enum: ["15 sec", "30 sec", "60 sec"],
  },
  generatedOutput: {
    hooks: [String],
    reelScript: [{
      scene: Number,
      visual: String,
      audio: String
    }],
    storyboard: [{
      shot: Number,
      description: String
    }],
    caption: String,
    hashtags: [String],
    thumbnailConcept: String,
    viralityScore: Number,
    engagementPrediction: String
  },
  mediaOutput: {
    imagePrompts: [{
      type: { type: String }, // thumbnail, poster, instagram, cinematic
      prompt: String,
      style: String,
      lighting: String,
      colorGrading: String,
      mood: String,
      composition: String,
      imageUrl: String,
      isSaved: { type: Boolean, default: false }
    }],
    videoPrompts: [{
      provider: String, // Runway, Kling, Pika, Luma
      prompt: String,
      cameraMovement: String,
      description: String,
      lighting: String,
      style: String,
      transitions: String,
      motionDirection: String,
      isSaved: { type: Boolean, default: false }
    }],
    scenePrompts: [{
      scene: Number,
      description: String,
      subtitle: String,
      cameraAngle: String,
      transition: String,
      audio: String
    }]
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  mediaStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Queued"],
    default: "Pending",
  },
  exportHistory: [{
    platform: String,
    exportedAt: { type: Date, default: Date.now }
  }],
  isFavorite: {
    type: Boolean,
    default: false
  },
  scheduledAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("GeneratedContent", GeneratedContentSchema);
