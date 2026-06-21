const express = require("express");
const User = require("../models/User");
const UsageLog = require("../models/UsageLog");
const Trip = require("../models/Trip");
const ProjectReview = require("../models/ProjectReview");
const Poll = require("../models/Poll");
const JobApplication = require("../models/JobApplication");
const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const { protect, adminOnly } = require("../middleware/protect");
const { admin, db } = require("../firebaseAdmin");
const { 
  sendUpdateEmail, 
  sendWeeklyTravelDigest, 
  sendInterestingFactEmail,
  sendTestEmail 
} = require("../services/emailService");

const router = express.Router();

// Middleware to verify admin status
const verifyAdminEmail = adminOnly;

/* BROADCAST DISCOVERY MOMENT */
router.post("/broadcast-discovery", protect, verifyAdminEmail, async (req, res) => {
  try {
    const { fact, destination } = req.body;
    if (!fact) return res.status(400).json({ error: "Fact content is required." });

    const users = await User.find({ 
      $or: [
        { "preferences.emailAlerts": true },
        { "preferences.emailAlerts": { $exists: false } }
      ]
    });

    console.log(`📧 Starting Discovery Moment broadcast to ${users.length} users...`);
    
    const broadcastPromises = users.map(user => 
      sendInterestingFactEmail(user.email, user.name, fact, destination).catch(err => 
        console.error(`❌ Failed to send discovery to ${user.email}:`, err.message)
      )
    );

    await Promise.all(broadcastPromises);

    res.json({ 
      message: "Discovery Moment broadcast initiated successfully!", 
      count: users.length 
    });
  } catch (err) {
    console.error("Discovery broadcast error:", err);
    res.status(500).json({ error: "Failed to broadcast Discovery Moment" });
  }
});

/* TEST EMAIL CONNECTION */
router.post("/test-email", protect, verifyAdminEmail, async (req, res) => {
  try {
    const info = await sendTestEmail(req.user.email);
    res.json({ 
      message: "Test email sent successfully! Check your inbox.", 
      info 
    });
  } catch (err) {
    console.error("Test email route error:", err);
    res.status(500).json({ 
      error: "Email delivery failed", 
      details: err.message,
      code: err.code,
      hint: "Check if EMAIL_PASS is an App Password and EMAIL_USER is correct."
    });
  }
});

/* BROADCAST WEEKLY DIGEST */
router.post("/broadcast-digest", protect, verifyAdminEmail, async (req, res) => {
  try {
    const users = await User.find({ 
      $or: [
        { "preferences.emailAlerts": true },
        { "preferences.emailAlerts": { $exists: false } }
      ]
    });

    console.log(`📧 Starting Weekly Digest broadcast to ${users.length} users...`);
    
    // Process in batches or concurrently (using Promise.all for simplicity here, but would use a queue in production)
    const broadcastPromises = users.map(user => 
      sendWeeklyTravelDigest(user.email, user.name).catch(err => 
        console.error(`❌ Failed to send digest to ${user.email}:`, err.message)
      )
    );

    await Promise.all(broadcastPromises);

    res.json({ 
      message: "Weekly Digest broadcast initiated successfully!", 
      count: users.length 
    });
  } catch (err) {
    console.error("Digest broadcast error:", err);
    res.status(500).json({ error: "Failed to broadcast Weekly Digest" });
  }
});

/* ANNOUNCEMENTS MANAGEMENT */
router.get("/announcements", protect, verifyAdminEmail, async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: "Error fetching announcements" });
  }
});

router.post("/announcements", protect, verifyAdminEmail, async (req, res) => {
  try {
    const { sendEmail, ...rest } = req.body;
    const announcement = new Announcement({
      ...rest,
      createdBy: req.user._id
    });
    await announcement.save();

    // 1. Create in-app notification for all users (global)
    await Notification.create({
      title: announcement.title,
      message: announcement.content,
      type: announcement.type === "promotion" ? "promo" : "info",
      link: announcement.link,
      userId: null // Global broadcast
    });

    // 2. Send email notification if requested
    if (sendEmail) {
      console.log(`📧 Starting announcement broadcast: ${announcement.title}`);
      // Fetch all users who haven't explicitly opted out, or all users if preference doesn't exist
      const users = await User.find({ 
        $or: [
          { "preferences.emailAlerts": true },
          { "preferences.emailAlerts": { $exists: false } }
        ]
      });
      const emails = users.map(u => u.email).filter(e => e);
      if (emails.length > 0) {
        console.log(`📧 Sending announcement to ${emails.length} users...`);
        // CRITICAL FIX: Await the email send so serverless functions don't terminate early
        await sendUpdateEmail(emails, announcement.title, announcement.content);
      } else {
        console.warn("⚠️ No eligible users found for email broadcast.");
      }
    }

    res.json(announcement);
  } catch (err) {
    res.status(500).json({ error: "Error creating announcement" });
  }
});

router.patch("/announcements/:id", protect, verifyAdminEmail, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(announcement);
  } catch (err) {
    res.status(500).json({ error: "Error updating announcement" });
  }
});

router.delete("/announcements/:id", protect, verifyAdminEmail, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting announcement" });
  }
});

/* TRIPS MANAGEMENT (CURATION) */
router.patch("/trips/:id/feature", protect, verifyAdminEmail, async (req, res) => {
  try {
    const { isFeatured, featuredReason } = req.body;
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { isFeatured, featuredReason },
      { new: true }
    );
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: "Error featuring trip" });
  }
});

/* GET /api/admin/whoami - Debug identity */
router.get("/whoami", protect, (req, res) => {
  res.json({ email: req.user?.email, role: req.user?.role });
});

const SystemConfig = require("../models/SystemConfig");

/* GET /api/admin/config/public - Publicly accessible site config */
router.get("/config/public", async (req, res) => {
  try {
    const configs = await SystemConfig.find() || [];
    // Convert array to a simple object for easier frontend use
    const configMap = {};
    if (Array.isArray(configs)) {
      configs.forEach(c => {
        if (c && c.key) configMap[c.key] = c.value;
      });
    }
    res.json(configMap);
  } catch (err) {
    console.error("Public config fetch error:", err);
    // Return empty object instead of 500 to prevent frontend crashes
    res.json({});
  }
});

/* GET /api/admin/config - Get site-wide config (Admin Only) */
router.get("/config", protect, verifyAdminEmail, async (req, res) => {
  try {
    const configs = await SystemConfig.find();
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: "Error fetching config" });
  }
});

/* POST /api/admin/config - Update specific config (e.g., homepage_images) */
router.post("/config", protect, verifyAdminEmail, async (req, res) => {
  try {
    const { key, value } = req.body;
    const config = await SystemConfig.findOneAndUpdate(
      { key },
      { value, updatedBy: req.user._id },
      { upsert: true, new: true }
    );
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Error updating config" });
  }
});

/* POST /api/admin/broadcast - Simulate a global system broadcast */
router.post("/broadcast", protect, verifyAdminEmail, async (req, res) => {
  try {
    const { message } = req.body;
    // In a real app, this might send a socket.io event or email
    console.log(`[GLOBAL BROADCAST] ${message}`);
    res.json({ message: "Broadcast signal sent successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Broadcast failure" });
  }
});

/* GET /api/admin/stats - Summary of all activity */
router.get("/stats", protect, verifyAdminEmail, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    // TRUTH: Only count actual plan generations by REAL USERS (not admins)
    const plansAgg = await UsageLog.aggregate([
      { 
        $match: { 
          action: { $in: ["generate_plan", "chatbot_plan_generated"] } 
        } 
      },
      {
        $lookup: {
          from: "users",
          let: { uId: "$userId" },
          pipeline: [
            { $match: { $expr: { $eq: [{ $toString: "$_id" }, "$$uId"] } } },
            { $project: { role: 1 } }
          ],
          as: "userInfo"
        }
      },
      {
        $match: {
          "userInfo.role": { $ne: "admin" }
        }
      },
      { $count: "count" }
    ]);
    
    const totalPlansGenerated = plansAgg.length > 0 ? plansAgg[0].count : 0;
    
    const totalUsageLogs = await UsageLog.countDocuments();
    const totalSavedTrips = await Trip.countDocuments();
    const totalReviews = await ProjectReview.countDocuments();
    const totalPolls = await Poll.countDocuments();
    const totalApplications = await JobApplication.countDocuments();

    // Today's Stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisitorsCount = await UsageLog.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: { $ifNull: ["$userId", { $ifNull: ["$details.guestId", "$ipAddress"] }] } } },
      { $count: "count" }
    ]);
    const todayUniqueVisitors = todayVisitorsCount.length > 0 ? todayVisitorsCount[0].count : 0;

    // Fetch Guest vs Logged-in stats from Firestore (with fallback)
    let guestCount = 0;
    let trackedUserCount = 0;
    let totalConversions = 0;

    // Use MongoDB UsageLog as a reliable fallback for Guest sessions
    const guestLogsCount = await UsageLog.countDocuments({ isGuest: true });
    const trackedUserCountFromLogs = await UsageLog.countDocuments({ isGuest: false });

    try {
      if (db) {
        const trackedSnapshot = await db.collection("users").get();
        const trackedData = trackedSnapshot.docs.map(doc => doc.data());
        
        guestCount = trackedData.filter(u => u.userType === 'guest').length;
        trackedUserCount = trackedData.filter(u => u.userType === 'user').length;
        totalConversions = trackedData.filter(u => u.converted === true).length;
      }
    } catch (fsErr) {
      console.error("Firestore stats error (non-fatal):", fsErr.message);
    }

    // Combine or fallback (Use the higher value to be safe, as Firestore might be out of sync)
    const finalGuestCount = Math.max(guestCount, guestLogsCount);
    const finalTrackedCount = Math.max(trackedUserCount, trackedUserCountFromLogs);

    // --- Retention Calculation (Original Data) ---
    // Registered Users Retention (Visited on 2+ different days)
    const returningUsersAgg = await UsageLog.aggregate([
      { $match: { userId: { $ne: null } } },
      {
        $group: {
          _id: "$userId",
          distinctDays: { 
            $addToSet: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } 
          }
        }
      },
      { $project: { dayCount: { $size: "$distinctDays" } } },
      { $match: { dayCount: { $gte: 2 } } },
      { $count: "count" }
    ]);
    const returningUsersCount = returningUsersAgg.length > 0 ? returningUsersAgg[0].count : 0;

    // Guest Retention (Visited on 2+ different days using guestId or IP)
    const returningGuestsAgg = await UsageLog.aggregate([
      { $match: { userId: null } },
      {
        $group: {
          _id: { $ifNull: ["$details.guestId", "$ipAddress"] },
          distinctDays: { 
            $addToSet: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } 
          }
        }
      },
      { $project: { dayCount: { $size: "$distinctDays" } } },
      { $match: { dayCount: { $gte: 2 } } },
      { $count: "count" }
    ]);
    const returningGuestsCount = returningGuestsAgg.length > 0 ? returningGuestsAgg[0].count : 0;

    // Total Retention Rate
    const totalVisitorsCount = await UsageLog.aggregate([
      { $group: { _id: { $ifNull: ["$userId", { $ifNull: ["$details.guestId", "$ipAddress"] }] } } },
      { $count: "count" }
    ]);
    const totalUniqueVisitors = totalVisitorsCount.length > 0 ? totalVisitorsCount[0].count : 0;
    const totalReturningCount = returningUsersCount + returningGuestsCount;
    const totalRetentionRate = totalUniqueVisitors > 0 ? ((totalReturningCount / totalUniqueVisitors) * 100).toFixed(1) : 0;

    // Retention Rate for registered users
    const retentionRate = totalUsers > 0 ? ((returningUsersCount / totalUsers) * 100).toFixed(1) : 0;

    // Monthly Active Users (MAU) - Simple version: users with activity in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const mauAgg = await UsageLog.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, userId: { $ne: null } } },
      { $group: { _id: "$userId" } },
      { $count: "count" }
    ]);
    const mauCount = mauAgg.length > 0 ? mauAgg[0].count : 0;

    // The most accurate "registered" count is usually MongoDB, but some might be Firebase-only
    const totalRegisteredCount = Math.max(totalUsers, trackedUserCount);

    // Get time-series data for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const growthData = await UsageLog.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sevenDaysAgo },
          action: { $in: ["generate_plan", "chatbot_plan_generated"] }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          plans: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const userData = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          users: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Merge growth and user data
    const chartData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const plansEntry = growthData.find(g => g._id === dateStr);
      const usersEntry = userData.find(u => u._id === dateStr);
      
      chartData.push({
        date: dateStr,
        plans: plansEntry ? plansEntry.plans : 0,
        users: usersEntry ? usersEntry.users : 0
      });
    }
    chartData.reverse();

    const recentUsers = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentUsage = await UsageLog.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(15);

    const recentReviews = await ProjectReview.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // ── Product Insights ──────────────────────────────
    // Top Trending Destinations (from plan generations)
    const topDestinations = await UsageLog.aggregate([
      { $match: { action: { $in: ["generate_plan", "chatbot_plan_generated"] }, "details.city": { $ne: null } } },
      { $group: { _id: "$details.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    // Peak Usage Hours (24h distribution)
    const peakHours = await UsageLog.aggregate([
      { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Most Popular Pages / Actions
    const topActions = await UsageLog.aggregate([
      { $group: { _id: "$action", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    // Popular Interests from plan generation
    const topInterests = await UsageLog.aggregate([
      { $match: { action: "chatbot_plan_generated", "details.interests": { $exists: true } } },
      { $unwind: "$details.interests" },
      { $group: { _id: "$details.interests", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    // Drop-off funnel: visitors → registered → generated plan → saved trip
    const usersWhoGeneratedPlan = await UsageLog.distinct("userId", { 
      action: { $in: ["generate_plan", "chatbot_plan_generated"] }, 
      userId: { $ne: null } 
    });
    const usersWhoSavedTrip = await Trip.distinct("userId");

    const funnel = {
      visitors: totalUniqueVisitors,
      registered: totalRegisteredCount,
      generatedPlan: usersWhoGeneratedPlan.length,
      savedTrip: usersWhoSavedTrip.length
    };

    res.json({
      summary: {
        totalRegisteredUsers: totalRegisteredCount,
        totalPlansGenerated: totalPlansGenerated,
        totalTripsSavedByUsers: totalSavedTrips,
        totalReviews,
        totalPolls,
        totalApplications,
        guestCount: finalGuestCount,
        trackedUserCount: finalTrackedCount,
        totalConversions,
        todayUniqueVisitors,
        returningUsersCount,
        returningGuestsCount,
        totalUniqueVisitors,
        totalRetentionRate,
        retentionRate,
        mauCount
      },
      growthChart: chartData,
      recentRegisteredUsers: recentUsers,
      recentActivityLogs: recentUsage,
      recentReviews,
      productInsights: {
        topDestinations,
        peakHours,
        topActions,
        topInterests,
        funnel
      }
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/* USERS MANAGEMENT */
router.get("/users", protect, verifyAdminEmail, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

router.get("/tracked-users", protect, verifyAdminEmail, async (req, res) => {
  try {
    let trackedUsers = [];
    
    // 1. Try fetching from Firestore
    if (db) {
      try {
        const usersSnapshot = await db.collection("users").orderBy("lastActive", "desc").limit(100).get();
        if (usersSnapshot && !usersSnapshot.empty) {
          trackedUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (fsErr) {
        console.warn("Firestore tracked-users warning (using fallback):", fsErr.message);
      }
    }

    // 2. Supplement with UsageLog data for Guests if needed
    const guestsInTracked = trackedUsers.filter(u => u.userType === 'guest').length;
    if (guestsInTracked === 0) {
      try {
        const recentGuestLogs = await UsageLog.find({ userId: null })
          .sort({ createdAt: -1 })
          .limit(50);
        
        const guestFromLogs = recentGuestLogs.map(log => ({
          userId: log.ipAddress || "Unknown IP",
          userType: 'guest',
          actionsCount: 1,
          lastActive: log.createdAt,
          lastAction: log.action,
          isFromLog: true
        }));

        // Deduplicate guests by IP/userId
        const seenIds = new Set(trackedUsers.map(u => u.userId));
        guestFromLogs.forEach(g => {
          if (!seenIds.has(g.userId)) {
            trackedUsers.push(g);
            seenIds.add(g.userId);
          }
        });
      } catch (logErr) {
        console.error("UsageLog fallback error:", logErr.message);
      }
    }

    res.json(trackedUsers);
  } catch (err) {
    console.error("Critical error in /tracked-users:", err);
    res.status(500).json({ error: "System error: " + err.message });
  }
});

router.patch("/users/:id/role", protect, verifyAdminEmail, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error updating role" });
  }
});

/* TRIPS MANAGEMENT */
router.get("/trips", protect, verifyAdminEmail, async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: "Error fetching trips" });
  }
});

router.delete("/trips/:id", protect, verifyAdminEmail, async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting trip" });
  }
});

/* REVIEWS MODERATION */
router.get("/reviews", protect, verifyAdminEmail, async (req, res) => {
  try {
    const reviews = await ProjectReview.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Error fetching reviews" });
  }
});

router.delete("/reviews/:id", protect, verifyAdminEmail, async (req, res) => {
  try {
    await ProjectReview.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting review" });
  }
});

/* CONTENT CLEANUP */
router.delete("/polls/:id", protect, verifyAdminEmail, async (req, res) => {
  try {
    await Poll.findOneAndDelete({ pollId: req.params.id });
    res.json({ message: "Poll deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting poll" });
  }
});

/* CAREERS APPLICATIONS MANAGEMENT */
router.get("/applications", protect, verifyAdminEmail, async (req, res) => {
  try {
    const applications = await JobApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: "Error fetching applications" });
  }
});

router.patch("/applications/:id/status", protect, verifyAdminEmail, async (req, res) => {
  try {
    const { status } = req.body;
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: "Error updating application status" });
  }
});

router.delete("/applications/:id", protect, verifyAdminEmail, async (req, res) => {
  try {
    await JobApplication.findByIdAndDelete(req.params.id);
    res.json({ message: "Application deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting application" });
  }
});

/* CHATBOT ANALYTICS */
router.get("/chatbot-stats", protect, verifyAdminEmail, async (req, res) => {
  try {
    const totalQueries = await UsageLog.countDocuments({ action: "chatbot_query" });
    const totalPlans = await UsageLog.countDocuments({ action: "chatbot_plan_generated" });
    
    const modelUsage = await UsageLog.aggregate([
      { $match: { action: "chatbot_query" } },
      { $group: { _id: "$details.model", count: { $sum: 1 } } }
    ]);

    const dailyQueries = await UsageLog.aggregate([
      { $match: { action: "chatbot_query" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    const popularCities = await UsageLog.aggregate([
      { $match: { action: "chatbot_plan_generated" } },
      { $group: { _id: "$details.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // NEW: Peak Hours
    const peakHours = await UsageLog.aggregate([
      { $match: { action: "chatbot_query" } },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // NEW: Popular Interests
    const popularInterests = await UsageLog.aggregate([
      { $match: { action: "chatbot_plan_generated" } },
      { $unwind: "$details.interests" },
      { $group: { _id: "$details.interests", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      summary: {
        totalQueries,
        totalPlansGenerated: totalPlans,
        conversionRate: totalQueries > 0 ? ((totalPlans / totalQueries) * 100).toFixed(1) : 0
      },
      modelUsage,
      dailyQueries,
      popularCities,
      peakHours,
      popularInterests
    });
  } catch (err) {
    console.error("Chatbot stats error:", err);
    res.status(500).json({ error: "Error fetching chatbot stats" });
  }
});

/* FEEDBACK MANAGEMENT */
const Feedback = require("../models/Feedback");

router.get("/feedback", protect, verifyAdminEmail, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: "Error fetching feedback" });
  }
});

router.get("/feedback/stats", protect, verifyAdminEmail, async (req, res) => {
  try {
    const total = await Feedback.countDocuments();
    const avgRating = await Feedback.aggregate([
      { $group: { _id: null, avg: { $avg: "$overallRating" } } }
    ]);
    
    const usefulBreakdown = await Feedback.aggregate([
      { $group: { _id: "$isUseful", count: { $sum: 1 } } }
    ]);
    
    const recommendBreakdown = await Feedback.aggregate([
      { $group: { _id: "$willRecommend", count: { $sum: 1 } } }
    ]);

    const ratingDistribution = await Feedback.aggregate([
      { $group: { _id: "$overallRating", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const topFeatures = await Feedback.aggregate([
      { $match: { favoriteFeature: { $ne: "" } } },
      { $group: { _id: "$favoriteFeature", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      total,
      averageRating: avgRating[0]?.avg?.toFixed(1) || 0,
      usefulBreakdown,
      recommendBreakdown,
      ratingDistribution,
      topFeatures
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching feedback stats" });
  }
});

router.delete("/feedback/:id", protect, verifyAdminEmail, async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: "Feedback deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting feedback" });
  }
});

module.exports = router;
