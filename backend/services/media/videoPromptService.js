/**
 * Service for generating cinematic video prompts for AI video generators.
 */
exports.getSystemPromptFragment = () => `
Inside the "mediaOutput" object, you MUST include an array named "videoPrompts".
Each object in "videoPrompts" MUST have:
- "provider": (e.g., "Runway", "Kling", "Pika", "Luma")
- "prompt": (the actual AI video prompt)
- "cameraMovement": (e.g., "Drone orbit", "Slow zoom")
- "description": (detailed visual description)
- "lighting": (lighting environment)
- "style": (cinematic style)
- "transitions": (suggested transitions)
- "motionDirection": (primary motion direction)
`;
