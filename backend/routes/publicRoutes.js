const express = require("express");
const router = express.Router();
const UsageLog = require("../models/UsageLog");
const Trip = require("../models/Trip");
const JobApplication = require("../models/JobApplication");
const Itinerary = require("../models/Itinerary");
const Announcement = require("../models/Announcement");
const { db } = require("../firebaseAdmin");
const { sendJobApplicationNotification } = require("../services/emailService");

let firestoreEnabled = true;

/* ── CAREERS ── */
router.post("/careers/apply", async (req, res) => {
  try {
    const { name, email, resume, note, jobId, jobTitle } = req.body;
    const application = await JobApplication.create({
      name,
      email,
      resume,
      note,
      jobId,
      jobTitle,
    });
    
    // Notify admin
    await sendJobApplicationNotification(application);

    res.status(201).json({ success: true, application });
  } catch (err) {
    console.error("Application error:", err);
    res.status(500).json({ error: "Failed to submit application" });
  }
});

/* ── TRACKING ── */
router.post("/track", async (req, res) => {
  try {
    const { userId, userType, guestId, action, details } = req.body;
    
    // id can be userId (if logged in) or guestId (if guest)
    const id = userId || guestId;
    if (!id) return res.status(400).json({ error: "No ID provided" });

    // 1. Log to UsageLog (MongoDB) for Live Feed
    UsageLog.create({
      action: action || "site_access",
      userId: userId || null,
      isGuest: !userId,
      details: { ...details, guestId },
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    }).catch(e => console.error("UsageLog error:", e.message));

    if (!db || !firestoreEnabled) {
      console.warn("Tracking skipped: Firestore not available or disabled due to auth error.");
      return res.status(200).json({ success: false, message: "Firestore not available" });
    }

    const userRef = db.collection("users").doc(id);
    let doc;
    try {
      doc = await userRef.get();
    } catch (dbErr) {
      if (dbErr.code === 16 || dbErr.message.includes("UNAUTHENTICATED")) {
        console.error("❌ Firestore Authentication Error. Disabling tracking.");
        firestoreEnabled = false;
        return res.status(200).json({ success: false, message: "Tracking disabled due to auth error" });
      }
      throw dbErr; // Re-throw other DB errors to be caught by outer catch
    }

    if (!doc.exists) {
      // Create new tracking doc
      await userRef.set({
        userId: id,
        userType: userType || "guest",
        actionsCount: 1,
        createdAt: new Date(),
        lastActive: new Date(),
        converted: false,
        email: req.body.email || null,
        lastAction: action || "init"
      });
    } else {
      // Update existing
      const data = doc.data();
      const updates = {
        actionsCount: (data.actionsCount || 0) + 1,
        lastActive: new Date(),
        lastAction: action || data.lastAction
      };
      
      if (req.body.email) updates.email = req.body.email;

      // Handle conversion: guest -> user
      if (userType === "user" && data.userType === "guest") {
        updates.userType = "user";
        updates.converted = true;
        updates.originalGuestId = data.userId;
      }

      await userRef.update(updates);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Tracking error:", err);
    res.status(500).json({ error: "Failed to track activity" });
  }
});

/* GET /api/public/recent-activity - Real-time planning pulse */
router.get("/recent-activity", async (req, res) => {
  try {
    // 1. Try to get recent plan generations from usage logs
    const recentLogs = await UsageLog.find({ action: "generate_plan" })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .catch(() => []); // Silent fallback for DB errors

    // 2. Map them to a cleaner format
    let activity = recentLogs.map(log => {
      const city = log.details?.city || "a city";
      const time = log.createdAt || new Date();
      return {
        id: log._id,
        city: city.charAt(0).toUpperCase() + city.slice(1).toLowerCase(),
        user: "A traveler",
        time,
        type: log.details?.interests?.[0] || "Custom"
      };
    });

    // 3. Fallback: If logs are empty, use recent saved trips
    if (activity.length === 0) {
      const recentTrips = await Trip.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .catch(() => []);
      
      activity = recentTrips.map(trip => ({
        id: trip._id,
        city: trip.destination || "Discovery",
        user: "Someone",
        time: trip.createdAt || new Date(),
        type: "Premium"
      }));
    }

    res.json({ activity: activity.slice(0, 3) });
  } catch (err) {
    console.error("Public activity API error:", err.message);
    res.json({ activity: [] }); // Never 500 here
  }
});

/* GET /api/public/trips - Discovery Page */
router.get("/trips", async (req, res) => {
  try {
    const { city, days, budget, sort } = req.query;
    const filter = { isPublic: true };

    if (city) filter.destination = new RegExp(city, "i");
    if (days) filter.days = parseInt(days);
    if (budget) {
      if (budget === "low") filter.totalBudget = { $lte: 3000 };
      if (budget === "medium") filter.totalBudget = { $gt: 3000, $lte: 10000 };
      if (budget === "high") filter.totalBudget = { $gt: 10000 };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "popular") sortOption = { likesCount: -1, views: -1 };
    if (sort === "recent") sortOption = { createdAt: -1 };

    // Use aggregation to get likes count for sorting if needed, or just find
    const trips = await Trip.find(filter)
      .populate("userId", "name photo")
      .sort(sortOption)
      .limit(20);

    res.json({ trips: trips || [] });
  } catch (err) {
    console.error("Public trips fetch error:", err);
    res.json({ trips: [] }); // Safe fallback
  }
});

/* GET /api/public/trips/:id - Public Trip View */
router.get("/trips/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate("userId", "name photo");
    if (!trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    // Increment views
    trip.views = (trip.views || 0) + 1;
    await trip.save();

    res.json({ trip });
  } catch (err) {
    console.error("Fetch trip error:", err);
    res.status(404).json({ error: "Trip not found or database error" });
  }
});

/* ── ANNOUNCEMENTS ── */
router.get("/announcements", async (req, res) => {
  try {
    const page = req.query.page || "all";
    const filter = { isActive: true };
    if (page !== "all") {
      filter.$or = [{ targetPage: "all" }, { targetPage: page }];
    }
    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
    res.json(announcements || []);
  } catch (err) {
    console.error("Announcements fetch error:", err);
    res.json([]); // Return empty array instead of 500
  }
});

/* GET /api/public/featured-trips - Community favorites and curated content */
router.get("/featured-trips", async (req, res) => {
  try {
    // 1. Get manually featured trips first
    const featured = await Trip.find({ isFeatured: true, isPublic: true })
      .limit(6)
      .lean();
    
    // 2. Supplement with popular trips if needed
    let remaining = 6 - featured.length;
    let popular = [];
    if (remaining > 0) {
      popular = await Trip.find({ isPublic: true, isFeatured: { $ne: true } })
        .sort({ likesCount: -1, views: -1 })
        .limit(remaining)
        .lean();
    }

    const allTrips = [...featured, ...popular];

    const enriched = allTrips.map(t => ({
      id: t._id,
      title: t.title || `${t.destination} Odyssey`,
      destination: t.destination,
      days: t.days,
      cost: t.totalTripCost || 0,
      saves: t.savesCount || Math.floor(Math.random() * 500) + 100,
      image: t.image || `https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80`,
      itinerary: t.itinerary || [],
      views: t.views || 0,
      likes: t.likes ? t.likes.length : 0,
      isFeatured: t.isFeatured || false,
      featuredReason: t.featuredReason || ""
    }));

    res.json({ trips: enriched });
  } catch (err) {
    console.error("Featured trips error:", err.message);
    res.json({ trips: [] });
  }
});

module.exports = router;
