const mongoose = require("mongoose");
const { admin, initialized } = require("../firebaseAdmin");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UsageLog = require("../models/UsageLog");
const { sendWelcomeEmail } = require("../services/emailService");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    let user = null;

    try {
      // 1. Try Firebase Token First (If initialized)
      if (initialized) {
        const decoded = await admin.auth().verifyIdToken(token);
        const email = decoded.email;

        user = await User.findOne({ email });

        if (!user) {
          console.log(`👤 Syncing new Firebase user to MongoDB: ${email}`);
          user = await User.create({
            firebaseUid: decoded.uid,
            email: email,
            name: decoded.name || "User",
            photo: decoded.picture || ""
          });

          // Send welcome email (background)
          console.log(`📧 Triggering welcome email for new user: ${email}`);
          sendWelcomeEmail(user.email, user.name).catch(e => console.error("Social welcome email error:", e.message));
        }
      } else {
        console.warn("Firebase Admin not initialized. Skipping Firebase token verification.");
        throw new Error("Firebase Admin not initialized");
      }
    } catch (firebaseErr) {
      // 2. Try Custom JWT Token
      try {
        if (!process.env.JWT_SECRET) {
          throw new Error("JWT_SECRET is not defined in environment variables");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id);
      } catch (jwtErr) {
        // Log both errors for debugging, but be concise
        console.warn(`Auth failed. Firebase: ${firebaseErr.message} | JWT: ${jwtErr.message}`);
        console.debug("Token that failed:", token.substring(0, 10) + "...");
        return res.status(401).json({ error: "Invalid or expired token" });
      }
    }

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;

    // Background logging (non-blocking)
    setTimeout(() => {
      UsageLog.create({
        action: "site_access",
        userId: user._id,
        isGuest: false,
        details: { path: req.path, method: req.method },
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      }).catch(err => console.error("Auto-log error:", err.message));
    }, 0);

    next();

  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ error: "Authentication failed" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Access denied. Admins only." });
  }
};

module.exports = { protect, adminOnly };
