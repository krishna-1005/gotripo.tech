/**
 * Service for generating detailed scene-by-scene prompts for video production.
 */
exports.getSystemPromptFragment = () => `
Inside the "mediaOutput" object, you MUST include an array named "scenePrompts".
Each object in "scenePrompts" MUST have:
- "scene": (sequence number)
- "description": (detailed visual description)
- "subtitle": (text overlay)
- "cameraAngle": (camera angle)
- "transition": (transition effect)
- "audio": (sound/music cues)
`;
