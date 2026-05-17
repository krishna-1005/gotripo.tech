const express = require("express");
const router = express.Router();
const ProjectReview = require("../models/ProjectReview");
const User = require("../models/User");
const { admin } = require("../firebaseAdmin");
const { sendWelcomeEmail } = require("../services/emailService");
const { reviewValidation } = require("../middleware/validator");

// Public route to get all project reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await ProjectReview.find().sort({ createdAt: -1 }) || [];
    res.json(Array.isArray(reviews) ? reviews : []);
  } catch (err) {
    console.error("Error fetching project reviews:", err);
    res.json([]); // Return empty array on error to prevent frontend crash
  }
});

// Protected route to post a project review
router.post("/", reviewValidation, async (req, res) => {
  try {
    const { rating, comment, name } = req.body;

    
    // Check for authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    const email = decoded.email;

    let user = await User.findOne({ email });
    if (!user) {
      // Create user if they don't exist (same logic as protect middleware)
      user = await User.create({
        firebaseUid: decoded.uid,
        email: email,
        name: decoded.name || "User",
        photo: decoded.picture || ""
      });

      // Send welcome email (background)
      sendWelcomeEmail(user.email, user.name).catch(e => console.error("Review sync welcome email error:", e.message));
    }

    const newReview = new ProjectReview({
      user: user._id,
      userName: user.name,
      userEmail: user.email,
      rating: Number(rating),
      comment: comment
    });

    await newReview.save();
    res.status(201).json(newReview);

  } catch (err) {
    console.error("Error posting project review:", err);
    res.status(500).json({ error: "Failed to post review" });
  }
});

module.exports = router;
