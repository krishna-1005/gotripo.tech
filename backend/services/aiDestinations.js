const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function suggestDestinations({ groupSize, budget, travelStyle, vibeTags }) {
  const systemPrompt = `
Suggest 3 perfect destinations IN INDIA for a group:
- Group Size: ${groupSize}
- Budget Tier: ${budget}
- Travel Style: ${travelStyle}
- Vibes: ${vibeTags.join(", ")}

STRICT RULE: ONLY suggest destinations within India.

Return JSON ONLY as an array of 3 objects:
[{
  "name": "City",
  "country": "India",
  "description": "2 lines",
  "imageUrl": "https://source.unsplash.com/featured/?city",
  "tags": ["Tag1", "Tag2"],
  "aiScore": 95
}]
`;

  try {
    const { createGroqCompletion } = require("../utils/groqClient");
    const chatCompletion = await createGroqCompletion(groq, {
      messages: [{ role: "user", content: systemPrompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(chatCompletion.choices[0].message.content);
    return data.suggestions || data.destinations || (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Groq Destination Error:", error);
    return [
      { name: "Goa", country: "India", description: "Beaches and nightlife.", tags: ["Beach"], aiScore: 90, imageUrl: "https://source.unsplash.com/featured/?goa" },
      { name: "Jaipur", country: "India", description: "Palaces and culture.", tags: ["Culture"], aiScore: 85, imageUrl: "https://source.unsplash.com/featured/?jaipur" },
      { name: "Rishikesh", country: "India", description: "Spiritual and adventure.", tags: ["Adventure"], aiScore: 80, imageUrl: "https://source.unsplash.com/featured/?rishikesh" }
    ];
  }
}

module.exports = { suggestDestinations };
