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
    const { yatraName, startingCity, travelDates, numberOfPeople, budget } = req.body;

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

      STRICT INSTRUCTIONS:
      1. Provide a logical flow for the pilgrimage.
      2. Include spiritual significance for each major stop.
      3. Suggest accommodation types based on the budget: ${budget}.
      4. Include local food recommendations.
      5. Return ONLY a valid JSON object.
      6. DO NOT include markdown code blocks like \`\`\`json. Return pure JSON.

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
        ]
      }
    `;

    let text = "";
    let success = false;

    // --- TRY GEMINI FIRST ---
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here") {
      try {
        console.log(`🔮 [Yatra] Attempting Gemini (gemini-1.5-flash)...`);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Try multiple model names for compatibility
        const modelNames = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.0-pro"];
        
        for (const modelName of modelNames) {
          try {
            console.log(`   Trying ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            text = result.response.text();
            if (text) {
              success = true;
              break;
            }
          } catch (mErr) {
            console.warn(`   ⚠️ ${modelName} failed:`, mErr.message);
          }
        }
      } catch (gemErr) {
        console.error("❌ [Yatra] Gemini provider failed completely.");
      }
    }

    // --- FALLBACK TO GROQ (Which we know works in this project) ---
    if (!success && process.env.GROQ_API_KEY) {
      try {
        console.log(`🚀 [Yatra] Falling back to Groq (llama-3.3-70b)...`);
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const chatCompletion = await groq.chat.completions.create({
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
