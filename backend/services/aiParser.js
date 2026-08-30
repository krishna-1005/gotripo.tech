const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function parsePrompt(prompt) {
  const systemPrompt = `
Extract travel details from the user request.
Return JSON ONLY:
{
  "days": number,
  "budget": "low | medium | high",
  "interests": ["food","temple","nature","nightlife"]
}
User prompt: ${prompt}
`;

  const { createGroqCompletion } = require("../utils/groqClient");
  const chatCompletion = await createGroqCompletion(groq, {
    messages: [{ role: "user", content: systemPrompt }],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" }
  });

  return JSON.parse(chatCompletion.choices[0].message.content);
}

module.exports = parsePrompt;
