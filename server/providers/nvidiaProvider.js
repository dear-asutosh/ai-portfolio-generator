const OpenAI = require("openai");
const dotenv = require("dotenv");

dotenv.config();

let nvidiaClient = null;
let lastApiKey = null;

/**
 * Initializes and returns the OpenAI-compatible NVIDIA API client.
 * Returns null or throws an error if the API key is not configured, 
 * allowing the fallback orchestrator to proceed.
 * 
 * @returns {OpenAI} - The initialized OpenAI client instance for NVIDIA.
 */
const getNvidiaClient = () => {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "xxxxxxxx") {
    throw new Error("NVIDIA_API_KEY is not configured or is a placeholder.");
  }

  // Re-initialize only if client doesn't exist or API key changed
  if (!nvidiaClient || lastApiKey !== apiKey) {
    nvidiaClient = new OpenAI({
      baseURL: "https://integrate.api.nvidia.com/v1",
      apiKey: apiKey,
    });
    lastApiKey = apiKey;
  }

  return nvidiaClient;
};

module.exports = getNvidiaClient;
