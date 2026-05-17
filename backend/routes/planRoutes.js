const express      = require("express");
const generatePlan = require("../logic/planner");
const { protect } = require("../middleware/protect");
const Trip         = require("../models/Trip");
const UsageLog     = require("../models/UsageLog");
const { admin } = require("../firebaseAdmin");
const User         = require("../models/User");
const jwt          = require("jsonwebtoken");
const { sendWelcomeEmail } = require("../services/emailService");
const { planValidation } = require("../middleware/validator");
const { getVibeSuggestions, getDreamWeaverSuggestions } = require("../services/aiPlanner");
const { getSavingsInsights } = require("../services/costService");

const router = express.Router();

/* ── Route Verification ── */
router.get("/ping", (req, res) => res.json({ status: "plan router ok" }));

/* ── Vibe-Based Suggestions ── */
router.all("/vibe-suggestions", async (req, res) => {
  const params = req.method === "POST" ? req.body : req.query;
  
  // Robustly parse integers, defaulting to 50 if invalid
  const adventure = parseInt(params.adventure);
  const modern = parseInt(params.modern);
  const social = parseInt(params.social);

  try {
    const suggestions = await getVibeSuggestions({
      adventure: isNaN(adventure) ? 50 : adventure,
      modern: isNaN(modern) ? 50 : modern,
      social: isNaN(social) ? 50 : social
    });
    
    res.json({ suggestions });
  } catch (err) {
    console.error("❌ Vibe suggestions route error:", err);
    res.status(500).json({ error: "Failed to get suggestions", details: err.message });
  }
});

/* ── AI Dream Weaver ── */
router.post("/dream-weaver", async (req, res) => {
  const { prompt } = req.body;
  
  try {
    const suggestions = await getDreamWeaverSuggestions(prompt);
    res.json({ suggestions });
  } catch (err) {
    console.error("Dream Weaver route error:", err);
    res.status(500).json({ error: "Failed to weave your dream" });
  }
});

/* ── Generate Trip Plan ── */
router.post("/generate", planValidation, async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: "Request body missing" });
  }

  const { city, cities, days, budget, interests, isMultiCity, travelerType, pace, sourceCity } = req.body;

  if (!days || !budget) {
    return res.status(400).json({ error: "days and budget are required" });
  }

  try {
    let userPreferences = {};
    let loggedUserId = null;
    let loggedUserRole = "guest";

    // Auth handling
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        let userObj = await User.findOne({ 
          $or: [
            { email: decoded.email },
            { firebaseUid: decoded.uid }
          ]
        });

        if (!userObj) {
          console.log(`👤 Syncing new Firebase user to MongoDB: ${decoded.email}`);
          userObj = await User.create({
            name: decoded.name || decoded.email.split('@')[0],
            email: decoded.email,
            firebaseUid: decoded.uid,
            role: "user"
          });

          // Send welcome email (background)
          sendWelcomeEmail(userObj.email, userObj.name).catch(e => console.error("Plan sync welcome email error:", e.message));
        }

        loggedUserId = userObj._id;
        loggedUserRole = userObj.role || "user";
        userPreferences = userObj.preferences || {};
      } catch (e) { 
        console.error("Auth verification failed:", e.message);
        // Fallback to legacy JWT if present
        try {
          if (process.env.JWT_SECRET) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userObj = await User.findById(decoded.id);
            if (userObj) {
              loggedUserId = userObj._id;
              loggedUserRole = userObj.role || "user";
              userPreferences = userObj.preferences || {};
            }
          }
        } catch (jwtErr) {}
      }
    }

    // Usage Log
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      await UsageLog.create({
        action: "generate_plan",
        userId: loggedUserId,
        isGuest: !loggedUserId,
        userRole: loggedUserRole,
        details: { city, cities, days, budget, interests, sourceCity },
        ipAddress: ip,
        userAgent: req.headers['user-agent']
      });
    } catch (logErr) {}

    let finalPlan;

    if (isMultiCity && Array.isArray(cities) && cities.length > 0) {
      // SMART MULTI-CITY LOGIC: PARALLEL GENERATION
      const daysPerCity = Math.floor(days / cities.length);
      
      // 1. Launch all city plan generations concurrently
      const cityPlanPromises = cities.map((cityName, i) => {
        const currentCityDays = (i === cities.length - 1) ? (days - (daysPerCity * (cities.length - 1))) : daysPerCity;
        if (currentCityDays <= 0) return Promise.resolve(null);

        return generatePlan({
          city: cityName,
          days: currentCityDays,
          budget: budget / cities.length,
          interests: interests || [],
          travelerType: travelerType || "solo",
          pace: pace || "moderate",
          userPreferences,
          language: req.body.language || "English"
        });
      });

      const cityPlans = await Promise.all(cityPlanPromises);

      // 2. Stitch them together in order
      const allItineraries = [];
      let totalTripCost = 0;
      let dayCounter = 1;

      for (let i = 0; i < cities.length; i++) {
        const cityPlan = cityPlans[i];
        if (!cityPlan) continue;

        // Remap days to be continuous and add city labels
        cityPlan.itinerary.forEach(d => {
          allItineraries.push({
            ...d,
            day: dayCounter,
            title: d.title || `Exploring ${cities[i]}`,
            theme: d.theme || `Vibes of ${cities[i]}`,
            // Ensure places know which city they belong to
            places: d.places.map(p => ({ ...p, city: cities[i] }))
          });
          dayCounter++;
        });
        totalTripCost += cityPlan.totalTripCost;
      }

      finalPlan = {
        city: cities.join(" → "),
        days: parseInt(days),
        itinerary: allItineraries,
        totalTripCost,
        totalBudget: budget,
        summary: `A multi-city adventure through ${cities.join(", ")}.`
      };
    } else {
      // SINGLE CITY LOGIC
      finalPlan = await generatePlan({
        city: city || "Bengaluru",
        days: parseInt(days),
        budget,
        interests: interests || [],
        travelerType: travelerType || "solo",
        pace: pace || "moderate",
        userPreferences,
        language: req.body.language || "English",
        sourceCity
      });
    }

    const destinationTitle = isMultiCity && Array.isArray(cities) ? cities.join(" → ") : finalPlan.city;

    // ALWAYS SAVE TO DB SO RESULTS PAGE CAN FETCH BY ID (even for guests)
    let savedTrip;
    try {
      const tripData = {
        userId: loggedUserId || null,
        createdBy: loggedUserId || null,
        isGuest: !loggedUserId,
        title: `${destinationTitle} ${isMultiCity ? 'Journey' : 'Plan'}`,
        destination: destinationTitle,
        days: finalPlan.days,
        itinerary: finalPlan.itinerary,
        totalTripCost: finalPlan.totalTripCost,
        totalBudget: finalPlan.totalBudget,
        budgetTier: finalPlan.budgetTier,
        summary: finalPlan.summary,
        travelerType: travelerType || "solo",
        pace: pace || "moderate",
        type: "plan",
        recommendedStay: finalPlan.recommendedStay,
        recommendedTransport: finalPlan.recommendedTransport,
        image: finalPlan.image || "",
        members: loggedUserId ? [{
          userId: loggedUserId,
          role: "organizer",
          rsvp: "confirmed"
        }] : []
      };
      
      savedTrip = await Trip.create(tripData);
      console.log(`✅ Plan saved to DB: ${savedTrip._id} (Guest: ${!loggedUserId})`);
    } catch (saveErr) {
      console.error("❌ Failed to save plan to DB:", saveErr.message);
      if (saveErr.errors) {
        Object.keys(saveErr.errors).forEach(key => {
          console.error(`  - Validation Error [${key}]:`, saveErr.errors[key].message);
          console.error(`    - Value:`, saveErr.errors[key].value);
        });
      } else {
        console.error(saveErr);
      }
    }

    const responsePlan = {
      ...(savedTrip ? savedTrip.toObject() : finalPlan),
      title: `${destinationTitle} ${isMultiCity ? 'Journey' : 'Plan'}`,
      destination: destinationTitle,
      travelerType: travelerType || "solo",
      pace: pace || "moderate",
      type: "plan"
    };

    // Safety fallback: Ensure we ALWAYS have an ID to prevent frontend "undefined"
    if (!responsePlan._id && !responsePlan.id) {
       console.warn("⚠️ Warning: Plan returned without ID. Using temporary ID.");
       responsePlan._id = "plan_" + Date.now();
    }

    // ADD SAVINGS INSIGHTS
    try {
      const insights = getSavingsInsights(responsePlan, req.body.startDate);
      responsePlan.savingsInsights = insights;
    } catch (insightErr) {
      console.error("❌ Failed to generate savings insights:", insightErr);
    }

    res.json({ plan: responsePlan });

  } catch (err) {
    console.error("❌ Plan generation error:", err);
    
    // Check if it's a known error (e.g., location not found)
    if (err.message && err.message.includes("Location not found")) {
      return res.status(404).json({ 
        error: "Location not found", 
        message: err.message,
        details: "We couldn't find coordinates for this destination. Please try a major city."
      });
    }

    res.status(500).json({ 
      error: "Failed to generate plan", 
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
});

/* ── Delete Trip ── */
router.delete("/:id", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Not authorized" });
    }

    await trip.deleteOne();
    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
