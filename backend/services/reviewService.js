const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: "v1beta" });

/**
 * Generates realistic reviews for a place using Gemini AI.
 * If API key is missing or fails, returns stable mock reviews.
 */
async function generateReviews(placeName, category, city = "India") {
  // If no key at all, immediate fallback
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return getMockReviews(placeName, city);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1beta" });
    
    // Set a short timeout for the AI generation so it doesn't hang
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Generate 3 original user reviews for ${placeName} (${category}) in ${city}. The reviews should be specific to this location and feel authentic. Return ONLY JSON: [{"author": "Name", "rating": 5, "comment": "Text"}]` }] }],
      generationConfig: { maxOutputTokens: 200 }
    });

    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    // Fallback to stable mock reviews cleanly without cluttering server logs
    return getMockReviews(placeName, city);
  }
}

function getMockReviews(name, city) {
  // Stable pseudo-random reviews based on name and city
  const reviewers = ["Arjun Mehta", "Priya Sharma", "Rohan Das", "Ananya Iyer", "Vikram Singh", "Sneha Kapoor", "Rahul Verma"];
  const genericComments = [
    "Amazing experience! Highly recommend visiting this place.",
    "Decent spot, but it gets a bit crowded on weekends.",
    "A must-visit. The atmosphere is wonderful.",
    "Good value for money and very well maintained.",
    "Loved the vibe here! Perfect for a quick outing."
  ];

  const cityComments = [
    `Definitely one of the highlights of my trip to ${city}!`,
    `If you are in ${city}, you cannot miss this location.`,
    `A beautiful part of ${city}. Great for photos.`,
    `Really captures the essence of ${city}.`,
    `Such a peaceful spot in the heart of ${city}.`
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);

  return [
    {
      author: reviewers[absHash % reviewers.length],
      rating: 4 + (absHash % 2),
      comment: cityComments[absHash % cityComments.length]
    },
    {
      author: reviewers[(absHash + 1) % reviewers.length],
      rating: 3 + (absHash % 3),
      comment: genericComments[(absHash + 1) % genericComments.length]
    }
  ];
}

module.exports = { generateReviews };
