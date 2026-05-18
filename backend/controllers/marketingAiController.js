const aiMarketingService = require("../services/aiMarketingService");
const MarketingCopy = require("../models/MarketingCopy");

exports.generateMarketingContent = async (req, res) => {
  const { prompt, contentType, tone } = req.body;

  if (!prompt || !contentType || !tone) {
    return res.status(400).json({ error: "Missing required fields: prompt, contentType, tone" });
  }

  try {
    const generatedData = await aiMarketingService.generateMarketingContent({
      prompt,
      contentType,
      tone
    });

    // Save to database
    const newCopy = await MarketingCopy.create({
      prompt,
      contentType,
      tone,
      generatedContent: generatedData,
      rawResponse: JSON.stringify(generatedData)
    });

    res.status(200).json({
      success: true,
      data: newCopy
    });
  } catch (error) {
    console.error("Marketing Controller Error:", error);
    res.status(500).json({
      error: "Failed to generate marketing content",
      message: error.message
    });
  }
};

exports.getSavedCampaigns = async (req, res) => {
  try {
    const campaigns = await MarketingCopy.find().sort({ createdAt: -1 }).limit(20);
    res.status(200).json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
};
