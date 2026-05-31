const fs = require("fs");
const path = require("path");

/**
 * Logs generation performance metrics to both a local JSONL file 
 * and prints a clean, detailed summary to the console.
 * 
 * @param {Object} entry - Benchmark entry object
 * @param {string} entry.provider - The provider name (NVIDIA, OpenRouter, Groq)
 * @param {string} entry.model - The exact model identifier
 * @param {string} entry.layer - The generation layer (e.g. Blueprint, HTML, CSS, JS)
 * @param {number} entry.durationMs - Duration of the API call in milliseconds
 * @param {boolean} entry.success - Whether the API call was successful
 * @param {number} entry.outputLength - Length of the output generated in characters
 * @param {Error|null} [entry.error] - Optional error object if success is false
 */
const logBenchmark = ({ provider, model, layer, durationMs, success, outputLength, error = null }) => {
  try {
    const logsDir = path.join(__dirname, "../logs");
    
    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const logFilePath = path.join(logsDir, "generation_benchmarks.jsonl");
    const logEntry = {
      timestamp: new Date().toISOString(),
      provider: provider || "Unknown",
      model: model || "Unknown",
      layer: layer || "Unknown",
      durationMs: durationMs || 0,
      success: !!success,
      outputLength: outputLength || 0,
      error: error ? error.message || String(error) : null
    };

    // Append to JSONL file
    fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + "\n", "utf8");

    // Print styled console log
    const durationSeconds = (durationMs / 1000).toFixed(2);
    const statusIcon = success ? "✓ Success" : "✗ Failed";
    const statusColor = success ? "\x1b[32m" : "\x1b[31m"; // Green or Red ANSI escape
    const resetColor = "\x1b[0m";

    console.log(
      `[Benchmark] 📊 Layer: \x1b[36m${layer}\x1b[0m | ` +
      `Model: \x1b[33m${model}\x1b[0m | ` +
      `Provider: \x1b[35m${provider}\x1b[0m | ` +
      `Time: ${durationSeconds}s | ` +
      `Status: ${statusColor}${statusIcon}${resetColor} | ` +
      `Length: ${outputLength} chars`
    );
  } catch (err) {
    console.error("[Benchmark Logger Error] Failed to log benchmark:", err.message);
  }
};

module.exports = { logBenchmark };
