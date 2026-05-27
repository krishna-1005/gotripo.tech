const express = require("express");
const User    = require("../models/User");
const Trip    = require("../models/Trip");
const { protect } = require("../middleware/protect");

const router = express.Router();

// All routes below require login
router.use(protect);

/* ═══════════════════════════════════════
   PROFILE
═══════════════════════════════════════ */

/* GET /api/profile  — full profile + live stats */
router.get("/", async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const tripsCount = await Trip.countDocuments({ userId: req.user._id });
    const upcoming = await Trip.countDocuments({userId: req.user._id,status: "upcoming"});
    const completed = await Trip.countDocuments({userId: req.user._id, status: "completed"});
    
    // Auto-grant badges if they don't have them
    let badgesUpdated = false;
    if (tripsCount > 0 && (!user.badges || user.badges.length === 0)) {
      user.badges.push({
        name: "First Step",
        icon: "🚶",
        description: "Started the journey with the first planned trip."
      });
      badgesUpdated = true;
    }
    if (completed > 0 && !user.badges.find(b => b.name === "Explorer")) {
      user.badges.push({
        name: "Explorer",
        icon: "🧭",
        description: "Successfully completed your first adventure."
      });
      badgesUpdated = true;
    }
    
    if (badgesUpdated) await user.save();

    res.json({
      user: {
        ...user.toJSON(),
        memberSince: user.createdAt,
        stats: {
          tripsPlanned:     tripsCount,
          savedPlacesCount: user.savedPlaces ? user.savedPlaces.length : 0,
          upcoming,
          completed,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* PUT /api/profile  — update name or bio or subscriptionTier */
router.put("/", async (req, res) => {
  try {
    const { name, bio, preferences, subscriptionTier } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio)  updates.bio  = bio;
    if (preferences) updates.preferences = preferences;
    if (subscriptionTier) updates.subscriptionTier = subscriptionTier;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ message: "Profile updated.", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* DELETE /api/profile  — delete account + all trips */
router.delete("/", async (req, res) => {
  try {
    await Trip.deleteMany({ userId: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Account deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* ═══════════════════════════════════════
   MY TRIPS
═══════════════════════════════════════ */

/* POST /api/profile/feedback  — like/dislike a place for future learning */
router.post("/feedback", async (req, res) => {
  try {
    const { placeName, type } = req.body; // type: 'like', 'dislike', 'skip'
    if (!placeName) return res.status(400).json({ error: "Place name required." });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!user.preferences) user.preferences = {};
    if (!user.preferences.likedPlaces) user.preferences.likedPlaces = [];
    if (!user.preferences.dislikedPlaces) user.preferences.dislikedPlaces = [];

    if (type === "like") {
      if (!user.preferences.likedPlaces.includes(placeName)) {
        user.preferences.likedPlaces.push(placeName);
      }
      user.preferences.dislikedPlaces = user.preferences.dislikedPlaces.filter(p => p !== placeName);
    } else if (type === "dislike") {
      if (!user.preferences.dislikedPlaces.includes(placeName)) {
        user.preferences.dislikedPlaces.push(placeName);
      }
      user.preferences.likedPlaces = user.preferences.likedPlaces.filter(p => p !== placeName);
    } else if (type === "skip") {
      // Logic for skipping could be adding to avoided or just tracking
    }

    await user.save();
    res.json({ message: "Feedback recorded.", preferences: user.preferences });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* GET /api/profile/trips?status=upcoming  — list all trips */
router.get("/trips", async (req, res) => {
  try {
    console.log(`[MY TRIPS] Fetching trips for user: ${req.user._id} (${req.user.email})`);
    
    const filter = { userId: req.user._id };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const trips = await Trip.find(filter).sort({ createdAt: -1 });
    console.log(`[MY TRIPS] Found ${trips.length} trips for user: ${req.user._id}`);

    res.json({ trips });

  } catch (err) {
    console.error("[MY TRIPS] Error fetching trips:", err);
    res.status(500).json({ error: "Server error." });
  }
});

/* POST /api/profile/trips  — save a new trip (from planner) */
router.post("/trips", async (req, res) => {
  try {
    const { 
      title, city, days, budget, interests, itinerary, 
      totalCost, totalBudget, remainingBudget, perDayBudget, 
      travelerType, pace, summary 
    } = req.body;

    console.log(`[SAVE TRIP] Attempting to save trip: "${title}" for user: ${req.user._id}`);

    if (!title || !days) {
      console.warn("[SAVE TRIP] Validation failed: missing title or days");
      return res.status(400).json({ error: "title and days are required." });
    }

    // Correctly handle itinerary if it's an array (new format) or object (old format)
    let formattedItinerary = [];
    
    if (Array.isArray(itinerary)) {
      console.log(`[SAVE TRIP] Itinerary is array with ${itinerary.length} days`);
      formattedItinerary = itinerary.map((dayData, idx) => ({
        day: (dayData.day || dayData.label || (idx + 1)).toString(),
        estimatedHours: dayData.estimatedHours || 0,
        estimatedCost: dayData.estimatedCost || 0,
        places: (dayData.places || []).map(p => ({
          name: p.name,
          lat: p.lat,
          lng: p.lng,
          estimatedCost: p.estimatedCost || p.avgCost || 0,
          estimatedHours: p.estimatedHours || p.timeHours || 0,
          category: p.category,
          rating: p.rating,
          reviews: p.reviews,
          tag: p.tag,
          userReviews: p.userReviews || []
        }))
      }));
    } else if (typeof itinerary === 'object' && itinerary !== null) {
      console.log(`[SAVE TRIP] Itinerary is object with keys: ${Object.keys(itinerary)}`);
      formattedItinerary = Object.entries(itinerary).map(([dayLabel, dayValue]) => {
        // Handle both: {"1": [places]} AND {"1": {places: [places]}}
        const places = Array.isArray(dayValue) ? dayValue : (dayValue.places || []);
        const estimatedHours = dayValue.estimatedHours || 0;
        const estimatedCost = dayValue.estimatedCost || 0;

        return {
          day: dayLabel,
          estimatedHours,
          estimatedCost,
          places: places.map(p => ({
            name: p.name,
            lat: p.lat,
            lng: p.lng,
            estimatedCost: p.estimatedCost || p.avgCost || 0,
            estimatedHours: p.estimatedHours || p.timeHours || 0,
            category: p.category,
            rating: p.rating,
            reviews: p.reviews,
            tag: p.tag,
            userReviews: p.userReviews || []
          }))
        };
      });
    }

    const trip = await Trip.create({
      userId: req.user._id,
      isGuest: false,
      title: title || "Custom Trip",
      destination: city || "Unknown",
      days: Number(days),
      itinerary: formattedItinerary,
      totalTripCost: Number(totalCost) || Number(req.body.cost) || 0,
      totalBudget: Number(totalBudget || budget || 0),
      remainingBudget: Number(remainingBudget) || 0,
      perDayBudget: Number(perDayBudget) || 0,
      travelerType,
      pace,
      summary,
      status: "upcoming"
    });

    console.log(`[TRIP SAVED] Saved for user: ${req.user.email}, isGuest: ${trip.isGuest}`);
    console.log(`[TRIP OBJECT]`, trip);
    res.status(201).json({ message: "Trip saved.", trip });
  } catch (err) {
    console.error("SAVE TRIP ERROR:", err);
    res.status(500).json({ error: "Server error saving trip: " + err.message });
  }
});

/* PATCH /api/profile/trips/:id/status  — mark upcoming/completed */
router.patch("/trips/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["upcoming", "ongoing", "completed"].includes(status))
      return res.status(400).json({ error: "Invalid status." });

    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    );
    if (!trip) return res.status(404).json({ error: "Trip not found." });

    res.json({ message: "Status updated.", trip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* DELETE /api/profile/trips/:id  — delete a trip */
router.delete("/trips/:id", async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    res.json({ message: "Trip deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* GET /api/profile/trips/:id/memories  — get memories for a trip */
router.get("/trips/:id/memories", async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id }, "title memories");
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    res.json({ title: trip.title, memories: trip.memories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* POST /api/profile/trips/:id/memories  — add a memory image URL */
router.post("/trips/:id/memories", async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: "imageUrl is required." });

    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $push: { memories: imageUrl } },
      { new: true }
    );
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    res.json({ message: "Memory added.", memories: trip.memories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* ═══════════════════════════════════════
   SAVED PLACES
═══════════════════════════════════════ */

/* GET /api/profile/saved-places */
router.get("/saved-places", async (req, res) => {
  try {
    const user = await User.findById(req.user._id, "savedPlaces");
    res.json({ savedPlaces: user.savedPlaces || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* POST /api/profile/saved-places  — bookmark a destination */
router.post("/saved-places", async (req, res) => {
  try {
    const { name, tag, img } = req.body;
    if (!name) return res.status(400).json({ error: "name is required." });

    const user = await User.findById(req.user._id);
    if (!user.savedPlaces) user.savedPlaces = [];
    
    const already = user.savedPlaces.find((p) => p.name === name);
    if (already) return res.status(400).json({ error: "Place already saved." });

    user.savedPlaces.push({ name, tag, img });
    await user.save();

    res.status(201).json({ message: "Place saved.", savedPlaces: user.savedPlaces });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

/* DELETE /api/profile/saved-places/:placeId  — remove bookmark (✕ button) */
router.delete("/saved-places/:placeId", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.savedPlaces) {
      return res.json({ message: "Place removed.", savedPlaces: [] });
    }
    
    user.savedPlaces = user.savedPlaces.filter(
      (p) => p._id && p._id.toString() !== req.params.placeId
    );
    await user.save();
    res.json({ message: "Place removed.", savedPlaces: user.savedPlaces });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

// const Trip = await Trip.create({
//   userId: req.user._id,
//   title: title || "Custom Trip",
//   destination: city || "Unknown",
//   days: days,
//   itinerary: Object.values(itinerary || {}),
//   totalTripCost: totalCost || 0,
//   status: "upcoming"
// });

/* ═══════════════════════════════════════
   PERSONALIZATION & PREFERENCES
═══════════════════════════════════════ */

/* POST /api/profile/preferences/track — track skip/visit to learn weights */
router.post("/preferences/track", async (req, res) => {
  try {
    const { category, action } = req.body; // action: 'skip', 'visit'
    if (!category || !action) {
      return res.status(400).json({ error: "category and action are required." });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!user.preferences.categoryWeights) {
      user.preferences.categoryWeights = new Map();
    }

    const currentWeight = user.preferences.categoryWeights.get(category) || 0;
    
    if (action === "skip") {
      // Decrease weight
      user.preferences.categoryWeights.set(category, currentWeight - 0.5);
      
      // If skipped many times, consider avoiding
      if (currentWeight < -3 && !user.preferences.avoidedCategories.includes(category)) {
        user.preferences.avoidedCategories.push(category);
      }
    } else if (action === "visit") {
      // Increase weight
      user.preferences.categoryWeights.set(category, currentWeight + 1.0);
      
      // Remove from avoided if they actually visited it
      user.preferences.avoidedCategories = user.preferences.avoidedCategories.filter(c => c !== category);
      
      // Add to interests if not there
      if (!user.preferences.interests.includes(category)) {
        user.preferences.interests.push(category);
      }
    }

    await user.save();
    res.json({ message: "Preference tracked.", preferences: user.preferences });
  } catch (err) {
    console.error("TRACK PREFERENCE ERROR:", err);
    res.status(500).json({ error: "Server error tracking preference." });
  }
});

/* PUT /api/profile/preferences — bulk update preferences */
router.put("/preferences", async (req, res) => {
  try {
    const { interests, preferredBudget } = req.body;
    const user = await User.findById(req.user._id);
    
    if (interests) user.preferences.interests = interests;
    if (preferredBudget) user.preferences.preferredBudget = preferredBudget;
    
    await user.save();
    res.json({ message: "Preferences updated.", preferences: user.preferences });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error updating preferences." });
  }
});

module.exports = router;