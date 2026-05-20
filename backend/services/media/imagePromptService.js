/**
 * Service for generating image prompts for thumbnails, posters, and social media.
 */
exports.getImagePrompts = (topic, tone) => {
  return [
    {
      type: "thumbnail",
      prompt: `Cinematic wide shot of ${topic}, high-end travel photography, Sony A7R IV, 24mm lens, f/8, sharp focus, volumetric lighting, golden hour, 8k resolution, photorealistic, vibrant colors, teal and orange color grading.`,
      style: "Cinematic, Professional Photography",
      lighting: "Dramatic golden hour, volumetric sunbeams",
      colorGrading: "Teal and Orange, High Dynamic Range",
      mood: "Epic, Aspirational",
      composition: "Rule of thirds, deep depth of field"
    },
    {
      type: "instagram",
      prompt: `Luxury travel influencer style photo of ${topic}, soft bokeh background, 35mm f/1.4 lens, warm natural lighting, dreamlike atmosphere, high fashion aesthetic, vibrant yet natural colors, 4k.`,
      style: "Luxury Lifestyle, Editorial",
      lighting: "Soft natural light, diffused glow",
      colorGrading: "Warm, film-like grain",
      mood: "Serene, Sophisticated",
      composition: "Medium shot, eye-level, shallow depth of field"
    }
  ];
};

exports.getSystemPromptFragment = () => `
Inside the "mediaOutput" object, you MUST include an array named "imagePrompts".
Each object in "imagePrompts" MUST be a professional-grade prompt suitable for Midjourney v6 or DALL-E 3.

Requirements for each "imagePrompt":
- "type": (e.g., "thumbnail", "poster", "instagram", "cinematic")
- "prompt": A highly detailed, technical photographic prompt. Include:
    * Camera & Lens (e.g., Sony A7R IV, 35mm f/1.4)
    * Lighting (e.g., volumetric lighting, global illumination, softbox)
    * Technical specs (e.g., 8k, photorealistic, octane render, Unreal Engine 5 style)
    * Descriptive adjectives that elevate the visual quality.
- "style": (visual style, e.g., "Cinematic", "Photorealistic", "Surreal")
- "lighting": (detailed lighting setup)
- "colorGrading": (specific color palette or film stock emulation)
- "mood": (the emotional feeling)
- "composition": (framing, e.g., "Low angle", "Bird's eye view", "Golden ratio")

DO NOT return generic or short prompts. Make them "acceptable" for elite-level AI generation.
`;
