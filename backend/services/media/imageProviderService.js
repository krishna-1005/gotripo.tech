const OpenAI = require("openai");

class ImageProviderService {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  }

  /**
   * Generates an image using DALL-E 3
   * @param {string} prompt - The detailed photographic prompt
   * @param {Object} options - Generation options (size, quality)
   */
  async generateImage(prompt, options = {}) {
    if (!this.openai) {
      console.warn("[ImageProviderService] OpenAI API Key not configured. Using placeholder.");
      return {
        success: true,
        url: `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop&sig=${Math.random()}`,
        provider: "Placeholder"
      };
    }

    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: options.size || "1024x1792", // Default to portrait for Reels/Stories
        quality: options.quality || "hd",
      });

      return {
        success: true,
        url: response.data[0].url,
        provider: "DALL-E 3"
      };
    } catch (error) {
      console.error("[ImageProviderService] DALL-E Error:", error.message);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }
}

module.exports = new ImageProviderService();
