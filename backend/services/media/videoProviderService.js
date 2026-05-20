/**
 * Abstraction layer for AI Video Generation providers.
 * Placeholders for future API integrations with Runway, Kling, Pika, and Luma.
 */

const axios = require("axios");

class VideoProviderService {
  constructor() {
    this.providers = {
      runway: {
        name: "Runway Gen-3",
        baseUrl: "https://api.dev.runwayml.com/v1",
        apiKey: process.env.RUNWAY_API_KEY
      },
      kling: {
        name: "Kling AI",
        baseUrl: process.env.KLING_API_URL,
        apiKey: process.env.KLING_API_KEY
      },
      pika: {
        name: "Pika Art",
        baseUrl: process.env.PIKA_API_URL,
        apiKey: process.env.PIKA_API_KEY
      },
      luma: {
        name: "Luma Dream Machine",
        baseUrl: process.env.LUMA_API_URL,
        apiKey: process.env.LUMA_API_KEY
      }
    };
  }

  /**
   * Triggers video generation on a specific provider
   */
  async generateVideo(providerId, prompt, options = {}) {
    const provider = this.providers[providerId.toLowerCase()];
    if (!provider) throw new Error(`Provider ${providerId} not supported`);
    if (!provider.apiKey) throw new Error(`API Key for ${provider.name} is not configured in .env`);

    console.log(`[VideoProviderService] Triggering generation on ${provider.name}...`);

    try {
      if (providerId.toLowerCase() === 'runway') {
        // Ensure duration is a number and ratio is correct
        const finalDuration = options.duration ? parseInt(options.duration) : 5;
        const finalRatio = options.aspectRatio === "9:16" ? "768:1280" : "1280:768";

        // Runway Gen-3 Turbo often requires an image. We'll use a high-quality 
        // travel placeholder if none is provided to ensure the API call succeeds.
        const placeholderImage = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop";

        const response = await axios.post(
          `${provider.baseUrl}/image_to_video`,
          {
            model: "gen3a_turbo",
            promptText: prompt,
            promptImage: options.promptImage || placeholderImage, // Required for Turbo
            watermark: false,
            duration: finalDuration,
            ratio: finalRatio,
            // Don't spread options directly to avoid overwriting types
            seed: options.seed ? parseInt(options.seed) : undefined
          },
          {
            headers: {
              "Authorization": `Bearer ${provider.apiKey}`,
              "X-Runway-Version": "2024-11-06",
              "Content-Type": "application/json"
            }
          }
        );

        return {
          success: true,
          jobId: response.data.id,
          status: response.data.status,
          provider: provider.name,
          raw: response.data
        };
      }

      // Placeholder for other providers
      return {
        success: true,
        jobId: `mock_job_${Math.random().toString(36).substr(2, 9)}`,
        status: "queued",
        provider: provider.name
      };
    } catch (error) {
      console.error(`[VideoProviderService] Error generating video with ${providerId}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.message || `Failed to trigger ${providerId} generation`);
    }
  }

  /**
   * Checks job status and retrieves video URL when ready
   */
  async getJobStatus(providerId, jobId) {
    const provider = this.providers[providerId.toLowerCase()];
    if (!provider) throw new Error(`Provider ${providerId} not supported`);
    if (!provider.apiKey) throw new Error(`API Key for ${provider.name} missing`);

    try {
      if (providerId.toLowerCase() === 'runway') {
        const response = await axios.get(`${provider.baseUrl}/tasks/${jobId}`, {
          headers: {
            "Authorization": `Bearer ${provider.apiKey}`,
            "X-Runway-Version": "2024-11-06"
          }
        });

        return {
          status: response.data.status, // "SUCCEEDED", "FAILED", "PENDING"
          progress: response.data.progress || 0,
          videoUrl: response.data.output?.[0], // Runway returns an array of outputs
          error: response.data.error
        };
      }

      return { status: "processing", progress: 50 };
    } catch (error) {
      console.error(`[VideoProviderService] Error checking status for ${jobId}:`, error.message);
      throw error;
    }
  }
}

module.exports = new VideoProviderService();
