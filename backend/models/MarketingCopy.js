const mongoose = require("mongoose");

const MarketingCopySchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  tone: {
    type: String,
    required: true,
  },
  generatedContent: {
    hook: String,
    caption: String,
    cta: String,
    hashtags: [String],
  },
  rawResponse: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MarketingCopy", MarketingCopySchema);
