const contentEngineService = require("../services/contentEngineService");
const GeneratedContent = require("../models/GeneratedContent");
const videoProviderService = require("../services/media/videoProviderService");
const imageProviderService = require("../services/media/imageProviderService");

exports.generateContent = async (req, res) => {
  const { topic, platform, contentType, tone, videoDuration } = req.body;

  if (!topic || !platform || !contentType || !tone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await contentEngineService.generateContent({
      topic,
      platform,
      contentType,
      tone,
      videoDuration
    });

    // Robust parsing: Handle both nested and flat structures
    const normalizeMedia = (obj) => {
      const media = obj.mediaOutput || {};
      return {
        imagePrompts: media.imagePrompts || obj.imagePrompts || media.image_prompts || obj.image_prompts || [],
        videoPrompts: media.videoPrompts || obj.videoPrompts || media.video_prompts || obj.video_prompts || [],
        scenePrompts: media.scenePrompts || obj.scenePrompts || media.scene_prompts || obj.scene_prompts || []
      };
    };

    const generatedOutput = result.generatedOutput || {
      hooks: result.hooks,
      reelScript: result.reelScript || result.reel_script,
      storyboard: result.storyboard,
      caption: result.caption,
      hashtags: result.hashtags,
      thumbnailConcept: result.thumbnailConcept || result.thumbnail_concept,
      viralityScore: result.viralityScore || result.virality_score,
      engagementPrediction: result.engagementPrediction || result.engagement_prediction
    };

    const mediaOutput = normalizeMedia(result);

    const newContent = await GeneratedContent.create({
      topic,
      platform,
      contentType,
      tone,
      videoDuration,
      generatedOutput,
      mediaOutput
    });

    res.status(201).json({
      success: true,
      data: newContent
    });
  } catch (error) {
    console.error("AI Content Engine Controller Error:", error);
    res.status(500).json({
      error: "Failed to generate content",
      message: error.message
    });
  }
};

exports.generateMedia = async (req, res) => {
  const { provider, prompt, options, contentId } = req.body;

  if (!provider || !prompt) {
    return res.status(400).json({ error: "Provider and prompt are required" });
  }

  try {
    const result = await videoProviderService.generateVideo(provider, prompt, options);
    
    // Update the GeneratedContent record with the job ID
    if (contentId) {
      await GeneratedContent.findByIdAndUpdate(contentId, {
        $push: { 'mediaOutput.jobs': { ...result, createdAt: new Date() } }
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Media Generation Error:", error);
    res.status(500).json({
      error: "Failed to start media generation",
      message: error.message
    });
  }
};

exports.getMediaStatus = async (req, res) => {
  const { provider, jobId } = req.query;

  if (!provider || !jobId) {
    return res.status(400).json({ error: "Provider and jobId are required" });
  }

  try {
    const status = await videoProviderService.getJobStatus(provider, jobId);
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch status" });
  }
};

exports.generateImage = async (req, res) => {
  const { id, imageId } = req.params;
  const { options } = req.body || {};

  try {
    const content = await GeneratedContent.findById(id);
    if (!content) return res.status(404).json({ error: "Content not found" });

    const imageItem = content.mediaOutput.imagePrompts.id(imageId);
    if (!imageItem) return res.status(404).json({ error: "Image prompt not found" });

    const result = await imageProviderService.generateImage(imageItem.prompt, options);
    
    imageItem.imageUrl = result.url;
    await content.save();

    res.status(200).json({
      success: true,
      data: imageItem
    });
  } catch (error) {
    console.error("Image Generation Error:", error);
    res.status(500).json({ error: "Failed to generate image", message: error.message });
  }
};

exports.getAllContent = async (req, res) => {
  try {
    const content = await GeneratedContent.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch content history" });
  }
};

exports.updateContentStatus = async (req, res) => {
  const { id } = req.params;
  const { status, mediaStatus, isFavorite, scheduledAt } = req.body;

  try {
    const updatedContent = await GeneratedContent.findByIdAndUpdate(
      id,
      { status, mediaStatus, isFavorite, scheduledAt },
      { new: true }
    );

    if (!updatedContent) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.status(200).json({
      success: true,
      data: updatedContent
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update content" });
  }
};

exports.deleteContent = async (req, res) => {
  const { id } = req.params;
  try {
    await GeneratedContent.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Content deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete content" });
  }
};

exports.toggleMediaSavedStatus = async (req, res) => {
  const { id, mediaId } = req.params;
  const { mediaType } = req.body; // 'image' or 'video'

  try {
    const content = await GeneratedContent.findById(id);
    if (!content) return res.status(404).json({ error: "Content not found" });

    let item;
    if (mediaType === 'image') {
      item = content.mediaOutput.imagePrompts.id(mediaId);
    } else {
      item = content.mediaOutput.videoPrompts.id(mediaId);
    }

    if (!item) return res.status(404).json({ error: "Media item not found" });

    item.isSaved = !item.isSaved;
    await content.save();

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle saved status", message: error.message });
  }
};

exports.getSavedMedia = async (req, res) => {
  try {
    const contents = await GeneratedContent.find({
      $or: [
        { "mediaOutput.imagePrompts.isSaved": true },
        { "mediaOutput.videoPrompts.isSaved": true }
      ]
    });

    const savedImages = [];
    const savedVideos = [];

    contents.forEach(content => {
      content.mediaOutput.imagePrompts.forEach(img => {
        if (img.isSaved) savedImages.push({ ...img.toObject(), contentId: content._id, topic: content.topic });
      });
      content.mediaOutput.videoPrompts.forEach(vid => {
        if (vid.isSaved) savedVideos.push({ ...vid.toObject(), contentId: content._id, topic: content.topic });
      });
    });

    res.status(200).json({
      success: true,
      data: {
        images: savedImages,
        videos: savedVideos
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch saved media", message: error.message });
  }
};
