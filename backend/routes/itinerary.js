const express = require("express");
const Itinerary = require("../models/Itinerary");
const Trip = require("../models/Trip");
const { protect } = require("../middleware/protect");
const router = express.Router();

const { generateAlerts } = require("../services/alertService");

// GET /api/itineraries/trip/:tripId/alerts - Fetch proactive alerts
router.get("/trip/:tripId/alerts", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const itinerary = await Itinerary.findOne({ tripId: req.params.tripId });
    const alerts = await generateAlerts(trip, itinerary);

    res.json(alerts);
  } catch (error) {
    console.error("Alert Fetch Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Helper for remix logic
async function remixLogic(original, req, res) {
  // 1. Clone the associated Trip first if possible, or create a new one
  const originalTrip = await Trip.findById(original.tripId);
  let newTripId = original.tripId;

  if (originalTrip) {
    const tripData = originalTrip.toObject();
    delete tripData._id;
    delete tripData.id;
    delete tripData.createdAt;
    delete tripData.updatedAt;
    tripData.userId = req.user._id;
    tripData.createdBy = req.user._id;
    tripData.title = `Remix of ${tripData.title}`;
    tripData.isPublic = false; // Remixed trip starts private
    
    const newTrip = await Trip.create(tripData);
    newTripId = newTrip._id;
  }

  // 2. Clone the Itinerary
  const itineraryData = original.toObject();
  delete itineraryData._id;
  delete itineraryData.id;
  delete itineraryData.createdAt;
  delete itineraryData.updatedAt;
  
  itineraryData.tripId = newTripId;
  itineraryData.clonedFrom = original._id;
  itineraryData.isPublic = false;
  
  // Update ownerId for all events
  itineraryData.days.forEach(day => {
    day.events.forEach(event => {
      event.ownerId = req.user._id;
    });
  });

  const remixedItinerary = await Itinerary.create(itineraryData);
  return res.status(201).json(remixedItinerary);
}

// POST /api/itineraries/:id/remix - Clone/Remix a public itinerary by ID
router.post("/:id/remix", protect, async (req, res) => {
  try {
    const original = await Itinerary.findById(req.params.id);
    if (!original) return res.status(404).json({ error: "Itinerary not found" });
    if (!original.isPublic) return res.status(403).json({ error: "This itinerary is not public" });

    return await remixLogic(original, req, res);
  } catch (error) {
    console.error("Remix Error:", error);
    res.status(500).json({ error: "Server error during remix" });
  }
});

// POST /api/itineraries/remix/trip/:tripId - Clone/Remix a public itinerary by its trip ID
router.post("/remix/trip/:tripId", protect, async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({ tripId: req.params.tripId });
    if (!itinerary) return res.status(404).json({ error: "Itinerary not found for this trip" });
    if (!itinerary.isPublic) return res.status(403).json({ error: "This itinerary is not public" });

    return await remixLogic(itinerary, req, res);
  } catch (error) {
    console.error("Remix Trip Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/itineraries/trip/:tripId
router.get("/trip/:tripId", protect, async (req, res) => {
  try {
    let itinerary = await Itinerary.findOne({ tripId: req.params.tripId })
      .populate("days.events.ownerId", "name photo");
    
    if (!itinerary) {
      itinerary = await Itinerary.create({ tripId: req.params.tripId, days: [] });
    }
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/itineraries/trip/:tripId/event
router.post("/trip/:tripId/event", protect, async (req, res) => {
  try {
    const { date, time, name, description, ownerId, status, linkedPollId } = req.body;
    let itinerary = await Itinerary.findOne({ tripId: req.params.tripId });
    
    if (!itinerary) {
      itinerary = new Itinerary({ tripId: req.params.tripId, days: [] });
    }

    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);

    let day = itinerary.days.find(d => {
      const dDate = new Date(d.date);
      dDate.setHours(0, 0, 0, 0);
      return dDate.getTime() === eventDate.getTime();
    });

    if (!day) {
      day = { date: eventDate, events: [] };
      itinerary.days.push(day);
      itinerary.days.sort((a, b) => new Date(a.date) - new Date(b.date));
      day = itinerary.days.find(d => new Date(d.date).getTime() === eventDate.getTime());
    }

    day.events.push({ time, name, description, ownerId, status, linkedPollId });
    await itinerary.save();
    
    const updatedItinerary = await Itinerary.findById(itinerary._id).populate("days.events.ownerId", "name photo");
    const io = req.app.get("io");
    if (io) io.to(req.params.tripId).emit("itinerary:updated", updatedItinerary);
    
    res.status(201).json(updatedItinerary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH /api/itineraries/trip/:tripId/event/:eventId
router.patch("/trip/:tripId/event/:eventId", protect, async (req, res) => {
  try {
    const { tripId, eventId } = req.params;
    const updates = req.body;
    
    const itinerary = await Itinerary.findOne({ tripId });
    if (!itinerary) return res.status(404).json({ error: "Itinerary not found" });

    let eventFound = false;
    for (let day of itinerary.days) {
      const event = day.events.id(eventId);
      if (event) {
        Object.assign(event, updates);
        eventFound = true;
        break;
      }
    }

    if (!eventFound) return res.status(404).json({ error: "Event not found" });

    await itinerary.save();
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/itineraries/trip/:tripId/event/:eventId
router.delete("/trip/:tripId/event/:eventId", protect, async (req, res) => {
  try {
    const { tripId, eventId } = req.params;
    const itinerary = await Itinerary.findOne({ tripId });
    if (!itinerary) return res.status(404).json({ error: "Itinerary not found" });

    let eventFound = false;
    for (let day of itinerary.days) {
      const initialLength = day.events.length;
      day.events = day.events.filter(e => e._id.toString() !== eventId);
      if (day.events.length < initialLength) {
        eventFound = true;
        break;
      }
    }

    if (!eventFound) return res.status(404).json({ error: "Event not found" });

    await itinerary.save();
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
