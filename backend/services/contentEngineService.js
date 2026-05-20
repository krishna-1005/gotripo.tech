const Groq = require("groq-sdk");
const imagePromptService = require("./media/imagePromptService");
const videoPromptService = require("./media/videoPromptService");
const storyboardService = require("./media/storyboardService");

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

/**
 * Generate viral content using AI
 * @param {Object} params
 */
exports.generateContent = async ({ topic, platform, contentType, tone, videoDuration }) => {
  if (!groq) {
    throw new Error("AI Service (Groq) not configured");
  }

  const systemPrompt = `
You are GoTripo's elite viral content strategist and cinematic media director.

Your role:
- Generate modern short-form travel content.
- Create high-end cinematic prompts for image and video generation tools.

CRITICAL INSTRUCTION:
You MUST return a JSON object with EXACTLY two top-level keys: "generatedOutput" and "mediaOutput". 
Do NOT return any other top-level keys.

${imagePromptService.getSystemPromptFragment()}
${videoPromptService.getSystemPromptFragment()}
${storyboardService.getSystemPromptFragment()}

REQUIRED JSON STRUCTURE:
{
  "generatedOutput": {
    "hooks": ["hook 1", "hook 2", "hook 3"],
    "reelScript": [{"scene": 1, "visual": "visual description", "audio": "audio/voiceover description"}],
    "storyboard": [{"shot": 1, "description": "shot description"}],
    "caption": "The social media caption",
    "hashtags": ["tag1", "tag2"],
    "thumbnailConcept": "Visual description for thumbnail",
    "viralityScore": 85,
    "engagementPrediction": "High engagement"
  },
  "mediaOutput": {
    "imagePrompts": [
      { "type": "thumbnail", "prompt": "...", "style": "...", "lighting": "...", "colorGrading": "...", "mood": "...", "composition": "..." }
    ],
    "videoPrompts": [
      { "provider": "Runway", "prompt": "...", "cameraMovement": "...", "description": "...", "lighting": "...", "style": "...", "transitions": "...", "motionDirection": "..." }
    ],
    "scenePrompts": [
      { "scene": 1, "description": "...", "subtitle": "...", "cameraAngle": "...", "transition": "...", "audio": "..." }
    ]
  }
}

Platform: ${platform}
Content Type: ${contentType}
Tone: ${tone}
Duration: ${videoDuration || 'N/A'}

Do not include markdown formatting like \`\`\`json. Return pure JSON.
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a full viral content and media kit for topic: ${topic}` }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI");

    return JSON.parse(content);
  } catch (error) {
    console.error("Content Engine Service Error:", error);
    throw error;
  }
};
