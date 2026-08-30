const { GoogleGenerativeAI } = require("@google/generative-ai");
const Trip = require("../models/Trip");
const supplierOrchestrator = require("./supplierOrchestrator");

/**
 * Agentic Rebooking Engine
 * Autonomously calculates the ripple effect of disruptions and prepares salvaged itineraries.
 */
async function processDisruption(trip, eventType, details = {}) {
  try {
    const Groq = require("groq-sdk");
    
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes("your_")) {
      console.error("❌ REBOOKING ERROR: GROQ_API_KEY is missing or using a placeholder in .env");
      return;
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log(`🤖 Rebooking Engine: Preserving Trip ${trip._id} (${eventType})`);

    const delayMinutes = details.delayMinutes || 30; // Default to 30 if not provided
    const disruptionContext = `Disruption: ${eventType || "General disruption"}. Delay: ${delayMinutes} minutes.`;

    const prompt = `
You are a travel logistics recovery system. A ${delayMinutes} minute delay has occurred.
Your ONLY task is to shift the schedule forward for ALL original activities.

### RULES:
1. DO NOT REMOVE ANY PLACES. All original stops must remain.
2. DO NOT ADD NEW PLACES.
3. FOR EVERY PLACE: Take the original "bestTime" (if provided) and shift it forward by ${delayMinutes} minutes.
4. RETURN: A valid JSON object containing the full updated itinerary.

### ORIGINAL STOPS (KEEP ALL):
${JSON.stringify(trip.itinerary.map(d => ({
  day: d.day,
  places: d.places.map(p => ({
    name: p.name,
    bestTime: p.bestTime || "10:00 AM", // Fallback if not set
    category: p.category
  }))
})))}

### OUTPUT JSON FORMAT:
{
  "impactSummary": "Shifted all activities by ${delayMinutes} minutes to account for the delay.",
  "itinerary": {
    "1": [ { "name": "Exact Place Name", "bestTime": "New Shifted Time", "reason": "Shifted due to delay" } ]
  }
}
`;

    const { createGroqCompletion } = require("../utils/groqClient");
    const chatCompletion = await createGroqCompletion(groq, {
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const salvagedData = JSON.parse(chatCompletion.choices[0].message.content);
    console.log("🤖 AI Salvaged Data:", JSON.stringify(salvagedData));

    const originalPlaces = trip.itinerary.flatMap(d => d.places);
    const updatedItinerary = [];

    // 3. Robust Data Normalization & Merging
    const rawItin = salvagedData.itinerary || {};
    
    Object.entries(rawItin).forEach(([dayKey, places]) => {
      // Normalize day label to "Day X"
      const dayNum = dayKey.replace(/\D/g, "");
      const dayLabel = dayNum || dayKey;
      
      const mergedPlaces = (Array.isArray(places) ? places : []).map(p => {
        // Try exact match first, then fuzzy match for place names
        const cleanAIName = (p.name || "").toLowerCase().trim();
        const original = originalPlaces.find(op => {
          const cleanOpName = (op.name || "").toLowerCase().trim();
          return cleanOpName === cleanAIName || cleanOpName.includes(cleanAIName) || cleanAIName.includes(cleanOpName);
        });

        if (original) {
          const obj = original.toObject();
          return {
            ...obj,
            bestTime: p.bestTime || obj.bestTime,
            timeReason: p.reason || `Rescheduled (+${delayMinutes}m)`
          };
        }
        return null;
      }).filter(p => p !== null);

      if (mergedPlaces.length > 0) {
        updatedItinerary.push({ day: dayLabel, places: mergedPlaces });
      }
    });

    // 4. ULTIMATE FALLBACK: If AI logic failed or returned empty results, manually shift original times
    if (updatedItinerary.length === 0) {
      console.warn("⚠️ AI merge failed or was empty. Manually shifting original itinerary as fallback.");
      trip.itinerary.forEach(day => {
        updatedItinerary.push({
          day: day.day,
          places: day.places.map(p => ({
            ...p.toObject(),
            bestTime: p.bestTime ? `Shifted (${p.bestTime})` : "10:30 AM",
            timeReason: `Manually delayed by ${delayMinutes} mins`
          }))
        });
      });
    }

    trip.pendingRevision = {
      itinerary: updatedItinerary,
      impactSummary: salvagedData.impactSummary || `Entire schedule shifted by ${delayMinutes} minutes to handle delay.`,
      recalculationReason: eventType || "Unforeseen Disruption",
      createdAt: new Date()
    };

    await trip.save();
    console.log(`✅ Itinerary salvaged for Trip ${trip._id}.`);
    await supplierOrchestrator.prepareNotifications(trip); 

  } catch (error) {
    console.error("❌ Rebooking Error:", error.message);
  }
}

module.exports = { processDisruption };
