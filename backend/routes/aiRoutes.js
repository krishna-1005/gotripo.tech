const express = require("express");
const { protect } = require("../middleware/protect");
const Groq = require("groq-sdk");
const Trip = require("../models/Trip");
const marketingAiController = require("../controllers/marketingAiController");

console.log("🚀 [AI] Groq AI Routes Initialized");

const router = express.Router();

// Initialize Groq
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// Marketing Routes
router.post("/marketing", protect, marketingAiController.generateMarketingContent);
router.get("/marketing/campaigns", protect, marketingAiController.getSavedCampaigns);

router.post("/itinerary", protect, async (req, res) => {
  console.log("🤖 [AI] Itinerary Request Received for:", req.body.destination);
  
  try {
    const { destination, dates, groupSize, lockedSuggestions, tripId } = req.body;

    if (!groq) {
      console.error("❌ [AI] GROQ_API_KEY is missing in .env");
      return res.status(500).json({ error: "AI Service (Groq) not configured" });
    }

    const systemPrompt = `
You are a world-class travel planner for GoTripo. Create a highly detailed, professional day-by-day itinerary for a trip to ${destination}.
Trip Context:
- Dates: ${dates}
- Group Size: ${groupSize}
- Locked/Voted Suggestions: ${JSON.stringify(lockedSuggestions || [])}

STRICT INSTRUCTIONS:
1. Incorporate ALL locked suggestions naturally into the itinerary.
2. Provide a diverse range of activities (food, landmark, adventure, etc.).
3. Return a valid JSON OBJECT with a key named "days" containing the array of itinerary days.
4. DO NOT include markdown formatting like \`\`\`json. Return pure JSON.

JSON Structure:
{
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "label": "Day Title",
      "theme": "explore",
      "activities": [
        {
          "id": "unique_string",
          "time": "HH:MM AM/PM",
          "title": "Activity Name",
          "location": "Location Name",
          "notes": "Brief helpful note",
          "type": "activity",
          "order": 0,
          "isAiGenerated": true
        }
      ]
    }
  ]
}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a professional travel planning assistant. Return JSON object only with a 'days' key." },
        { role: "user", content: systemPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from Groq");

    console.log("DEBUG: Groq Response Content:", content);

    const data = JSON.parse(content);
    let finalItinerary = [];
    
    if (Array.isArray(data)) {
      finalItinerary = data;
    } else if (data.days && Array.isArray(data.days)) {
      finalItinerary = data.days;
    } else if (data.itinerary && Array.isArray(data.itinerary)) {
      finalItinerary = data.itinerary;
    }

    console.log(`✅ [AI] Successfully generated ${finalItinerary.length} days for ${destination}`);

    // Persist to Database
    if (tripId && finalItinerary.length > 0) {
      await Trip.findByIdAndUpdate(tripId, { itinerary: finalItinerary });
      console.log(`💾 [AI] Saved itinerary to database for trip: ${tripId}`);
    }

    const io = req.app.get("io");
    if (io) {
      io.to(tripId || req.params.tripId).emit("itinerary:aiRegenerated", finalItinerary);
      io.to(tripId || req.params.tripId).emit("itinerary:updated", finalItinerary);
    }

    res.json(finalItinerary);
  } catch (error) {
    console.error("❌ [AI] Groq Error:", error.message);
    res.status(500).json({ error: "Failed to generate AI itinerary", details: error.message });
  }
});

router.post("/swap", protect, async (req, res) => {
  try {
    const { activityName, destination, currentItinerary, dayIndex, activityId } = req.body;

    if (!groq) {
      return res.status(500).json({ error: "AI Service not configured" });
    }

    const prompt = `
      Suggest ONE alternative for the activity "${activityName}" in ${destination}. 
      The current itinerary for this day is: ${JSON.stringify(currentItinerary)}.
      Return a JSON object for the NEW activity with the following fields: 
      {
        "time": "Keep the same as ${activityName}",
        "title": "New Activity Name",
        "location": "New Location",
        "notes": "Short tip",
        "type": "activity",
        "isAiGenerated": true
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a professional travel assistant. Return JSON only." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices?.[0]?.message?.content;
    const newActivity = JSON.parse(content);
    res.json(newActivity);
  } catch (error) {
    console.error("AI Swap Error:", error);
    res.status(500).json({ error: "Failed to suggest alternative" });
  }
});

module.exports = router;
