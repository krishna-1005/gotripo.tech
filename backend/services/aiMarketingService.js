const Groq = require("groq-sdk");

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

/**
 * Generate marketing content using AI
 * @param {Object} params
 * @param {string} params.prompt
 * @param {string} params.contentType
 * @param {string} params.tone
 */
exports.generateMarketingContent = async ({ prompt, contentType, tone }) => {
  if (!groq) {
    throw new Error("AI Service (Groq) not configured");
  }

  const systemPrompt = `
You are GoTripo's elite startup marketing strategist.

Your role:
- Generate high-conversion travel marketing content
- Create viral hooks
- Write modern social media captions
- Optimize for engagement and clicks
- Keep outputs concise and emotionally compelling

Rules:
- Avoid robotic AI wording
- Avoid corporate tone
- Write like a premium modern travel startup
- Use curiosity and FOMO naturally
- Include strong CTA

Content Context:
- Target: ${contentType}
- Tone: ${tone}
- Goal: ${prompt}

Output format:
Return a JSON object with the following structure:
{
  "hook": "The viral hook",
  "caption": "The main caption text",
  "cta": "The call to action",
  "hashtags": ["hashtag1", "hashtag2", ...]
}

Do not include markdown formatting like \`\`\`json. Return pure JSON.
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate marketing content for: ${prompt}` }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI");

    return JSON.parse(content);
  } catch (error) {
    console.error("AI Marketing Service Error:", error);
    throw error;
  }
};
