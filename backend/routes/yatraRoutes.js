const express = require("express");
const Yatra = require("../models/Yatra");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

const router = express.Router();

// 1. GET /api/yatra - fetch all yatras
router.get("/", async (req, res) => {
  try {
    const yatras = await Yatra.find();
    res.json(yatras);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch yatras" });
  }
});

// 2. GET /api/yatra/:id - fetch single yatra
router.get("/:id", async (req, res) => {
  try {
    const yatra = await Yatra.findById(req.params.id);
    if (!yatra) return res.status(404).json({ error: "Yatra not found" });
    res.json(yatra);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch yatra details" });
  }
});

// 3. POST /api/yatra/generate-itinerary
router.post("/generate-itinerary", async (req, res) => {
  try {
    const { yatraName, startingCity, travelDates, numberOfPeople, budget, transportMode, totalBudget } = req.body;

    if (!yatraName || !startingCity || !travelDates) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const prompt = `
      You are a spiritual travel expert for GoTripo. 
      Generate a detailed day-by-day itinerary for a Yatra called "${yatraName}".
      Details:
      - Starting City: ${startingCity}
      - Travel Dates: ${travelDates}
      - Number of People: ${numberOfPeople}
      - Budget Preference: ${budget}
      - Transport Mode: ${transportMode} 
      - Total Budget: ₹${totalBudget} for ${numberOfPeople} people

      STRICT INSTRUCTIONS:
      1. Provide a logical flow for the pilgrimage.
      2. Include spiritual significance for each major stop.
      3. Suggest accommodation types based on the budget: ${budget}.
      4. Include local food recommendations.
      5. Include transport booking tips for ${transportMode} from ${startingCity} to ${yatraName}.
      6. Suggest stays and food within the remaining budget after transport.
      7. Return ONLY a valid JSON object.
      8. DO NOT include markdown code blocks like \`\`\`json. Return pure JSON.

      JSON Structure:
      {
        "yatraName": "${yatraName}",
        "summary": "...",
        "itinerary": [
          {
            "day": 1,
            "title": "...",
            "activities": ["...", "..."],
            "spiritualSignificance": "...",
            "accommodation": "...",
            "food": "..."
          }
        ],
        "packingList": [
          { "item": "...", "reason": "..." },
          { "item": "...", "reason": "..." }
        ]
      }
    `;

    let text = "";
    let success = false;

    // --- TRY GEMINI FIRST ---
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const modelNames = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];
        
        for (const modelName of modelNames) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            text = result.response.text();
            if (text) {
              success = true;
              break;
            }
          } catch (mErr) {
            // Silently try next model
          }
        }
      } catch (gemErr) {
        // Silently fall through to Groq
      }
    }

    // --- FALLBACK TO GROQ ---
    if (!success && process.env.GROQ_API_KEY) {
      try {
        const { createGroqCompletion } = require("../utils/groqClient");
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const chatCompletion = await createGroqCompletion(groq, {
          messages: [
            { role: "system", content: "You are a professional travel assistant. Return JSON only." },
            { role: "user", content: prompt }
          ],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" }
        });
        text = chatCompletion.choices[0].message.content;
        success = true;
      } catch (groqErr) {
        console.error("❌ [Yatra] Groq fallback failed:", groqErr.message);
      }
    }

    if (!success) {
      return res.status(500).json({ 
        error: "All Divine AI providers are currently unreachable.",
        details: "Please ensure at least one valid API key (Gemini or Groq) is configured in your backend .env file."
      });
    }
    
    // Clean potential markdown blocks
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
      const data = JSON.parse(text);
      console.log(`✅ [Yatra] Itinerary generated successfully for ${yatraName}`);
      res.json(data);
    } catch (parseErr) {
      console.error("❌ [Yatra] JSON Parse Error:", text);
      res.status(500).json({ error: "The AI returned an invalid format. Please try again." });
    }

  } catch (err) {
    console.error("❌ [Yatra] Unexpected Error:", err.message);
    res.status(500).json({ error: "Internal Server Error during generation." });
  }
});

module.exports = router;
