const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const admin = require("../firebaseAdmin");
const User = require("../models/User");

// POST /api/feedback - Submit feedback
router.post("/", async (req, res) => {
  try {
    const { name, email, isUseful, willUseAgain, willRecommend, overallRating, improvements, favoriteFeature } = req.body;

    // Validate required fields
    if (!isUseful || !willUseAgain || !willRecommend || !overallRating) {
      return res.status(400).json({ error: "All rating fields are required." });
    }

    let userId = null;

    // Try to identify user from auth token (optional)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = await admin.auth().verifyIdToken(token);
        const userObj = await User.findOne({
          $or: [{ email: decoded.email }, { firebaseUid: decoded.uid }]
        });
        if (userObj) userId = userObj._id;
      } catch (err) {
        // Auth is optional for feedback, continue without user
      }
    }

    const feedback = await Feedback.create({
      userId,
      name: name || "Anonymous",
      email: email || "",
      isUseful,
      willUseAgain,
      willRecommend,
      overallRating,
      improvements: improvements || "",
      favoriteFeature: favoriteFeature || ""
    });

    res.status(201).json({ 
      success: true, 
      message: "Thank you for your feedback! It means the world to us. 🙏",
      feedbackId: feedback._id 
    });
  } catch (error) {
    console.error("[Feedback] Submit error:", error);
    res.status(500).json({ error: "Failed to submit feedback. Please try again." });
  }
});

// GET /api/feedback/stats - Get feedback statistics (admin use)
router.get("/stats", async (req, res) => {
  try {
    const total = await Feedback.countDocuments();
    const avgRating = await Feedback.aggregate([
      { $group: { _id: null, avg: { $avg: "$overallRating" } } }
    ]);

    res.json({
      totalFeedbacks: total,
      averageRating: avgRating[0]?.avg?.toFixed(1) || 0
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
