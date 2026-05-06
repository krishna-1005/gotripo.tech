const mongoose = require("mongoose");

const yatraSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  duration: { type: String, required: true }, // e.g., "4 Days"
  bestTimeToVisit: { type: String, required: true },
  highlights: [{ type: String }],
  imageUrl: { type: String, required: true },
  category: { type: String, default: "pilgrimage" } // pilgrimage, spiritual
}, { timestamps: true });

module.exports = mongoose.model("Yatra", yatraSchema);
