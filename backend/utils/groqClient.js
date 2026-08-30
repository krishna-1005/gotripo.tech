const GROQ_MODELS = [
  "qwen/qwen3.6-27b",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b"
];

/**
 * Strip <think>...</think> reasoning blocks that Qwen 3 models emit.
 * Also handles truncated responses where </think> is missing.
 */
function stripThinkTags(text) {
  if (!text) return text;
  // 1. Remove complete <think>...</think> blocks
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
  // 2. Remove truncated <think> blocks (no closing tag — response was cut off)
  cleaned = cleaned.replace(/<think>[\s\S]*/gi, "");
  return cleaned.trim();
}

/**
 * Call Groq chat completions with automatic model fallback list.
 * If the requested model is unavailable (404/decommissioned), tries the next one.
 * Automatically strips Qwen <think> tags from responses.
 */
async function createGroqCompletion(groq, options) {
  if (!groq) throw new Error("Groq SDK instance not initialized");

  const requestedModel = options.model || GROQ_MODELS[0];
  const modelsToTry = [requestedModel, ...GROQ_MODELS.filter(m => m !== requestedModel)];

  // For Qwen thinking models, prepend /no_think to suppress reasoning output
  const patchedOptions = { ...options };
  const isQwenModel = (model) => model.includes("qwen");

  let lastError = null;
  for (const model of modelsToTry) {
    try {
      const callOptions = { ...patchedOptions, model };

      // Suppress Qwen thinking by prepending /no_think to the last user message
      if (isQwenModel(model) && callOptions.messages && callOptions.messages.length > 0) {
        callOptions.messages = callOptions.messages.map((msg, i) => {
          if (i === callOptions.messages.length - 1 && msg.role === "user") {
            return { ...msg, content: "/no_think\n" + msg.content };
          }
          return msg;
        });
      }

      const completion = await groq.chat.completions.create(callOptions);

      // Safety: strip any residual <think> tags from the response
      if (completion?.choices?.[0]?.message?.content) {
        completion.choices[0].message.content = stripThinkTags(completion.choices[0].message.content);
      }

      return completion;
    } catch (err) {
      lastError = err;
      const errMsg = err?.message || "";
      const isModelUnavailable =
        err?.status === 404 ||
        errMsg.includes("model_not_found") ||
        errMsg.includes("does not exist") ||
        errMsg.includes("decommissioned") ||
        errMsg.includes("model_decommissioned") ||
        errMsg.includes("json_validate_failed");
      if (isModelUnavailable) {
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

module.exports = { createGroqCompletion, GROQ_MODELS };
