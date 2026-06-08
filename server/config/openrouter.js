/**
 * OpenRouter AI Client — Profilio Orchestration Engine
 *
 * Implements the 4-stage AI orchestration pipeline for portfolio generation.
 * Each stage has a dedicated model registry tuned for its specific responsibility.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  STAGE 1 — Content Planning      moonshotai/kimi-k2.6:free          │
 * │  STAGE 2 — HTML Architecture     qwen/qwen3-235b-a22b:free          │
 * │  STAGE 3 — Visual Design (CSS)   nvidia/nemotron-3-super-120b:free  │
 * │  STAGE 4 — Interaction Engine    nvidia/nemotron-3-super-120b:free  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * UPDATE WORKFLOW MODEL ROUTING:
 *   Content edits  → BLUEPRINT_MODELS  (Kimi K2)
 *   Layout edits   → HTML_MODELS       (Qwen3 Coder)
 *   Design edits   → CSS_MODELS        (Nemotron Super)
 *   JS edits       → JS_MODELS         (Nemotron Super)
 *
 * FALLBACK CHAIN PHILOSOPHY:
 *   - Never use openrouter/auto for code generation layers (HTML/CSS/JS).
 *     Quality consistency matters more than cost savings on those layers.
 *   - openrouter/auto is acceptable for content/blueprint tasks only.
 *   - Groq is the ultimate last-resort fallback across all layers.
 */

const OpenAI = require("openai");
const dotenv = require("dotenv");
const getNvidiaClient = require("../providers/nvidiaProvider");
const { logBenchmark } = require("../services/benchmarkLogger");

dotenv.config();

let openRouterClient = null;
let lastApiKey = null;

const getOpenRouterClient = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is missing.");
  }

  // Recreate client if API key has changed
  if (!openRouterClient || lastApiKey !== apiKey) {
    openRouterClient = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      defaultHeaders: {
        "HTTP-Referer": process.env.APP_URL || "https://profilio-backend.vercel.app/",
        "X-Title": "Profilio - AI Portfolio Generator",
      },
    });
    lastApiKey = apiKey;
  }

  return openRouterClient;
};

// ─── Stage 1: Content Planning — Blueprint Layer ───────────────────────────
//
// Primary: openrouter/free — dynamic routing picks whichever free model is
//          currently healthy, avoiding individual model 429 delays entirely.
// Fallback 1: GLM-4.5 Air — most reliable specific free-tier model.
// Fallback 2: Gemma 4 31B — good safety net (but frequently rate-limited).
// Fallback 3: Kimi K2.6 — strong reasoning, slower.
// Fallback 4: openrouter/auto — last resort dynamic routing (may incur cost).

const BLUEPRINT_MODELS = [
  "openrouter/auto",
  "openrouter/free",
  "z-ai/glm-4.5-air:free",
  "google/gemma-4-31b-it:free",
  "moonshotai/kimi-k2.6:free",
];

// ─── Stage 2: HTML Architecture Layer ─────────────────────────────────────
//
// Primary: Qwen3 235B A22B — strongest free-tier HTML/frontend model.
//          Superior semantic HTML generation and Tailwind class accuracy.
// Fallback 1: Qwen3 Coder (standard) — same family, reliable code output.
// Fallback 2: DeepSeek V4 Flash — strong instruction-following, good HTML.
// Fallback 3: Llama 3.3 70B — solid free-tier general fallback.
//
// NOTE: Never use openrouter/auto here. HTML quality directly determines
//       whether the portfolio looks premium or generic.

const HTML_MODELS = [
  "qwen/qwen3-coder:free",
  "openrouter/free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "z-ai/glm-4.5-air:free",
  "google/gemma-4-31b-it:free",
  "openrouter/auto",
];

// ─── Stage 3: Visual Design System — Premium CSS Layer ────────────────────
//
// Primary: Nemotron 3 Super 120B — 120B hybrid MoE, excels at creative output,
//          @keyframes, glassmorphism, complex gradient systems, and pseudo-elements.
// Fallback 1: DeepSeek V4 Flash — strong at structured CSS with clear requirements.
// Fallback 2: Gemma 4 31B — decent creative CSS, good knowledge of modern patterns.
//
// NOTE: This is the most creative layer. Nemotron's large context (1M tokens)
//       and creative training make it ideal for premium CSS effects.

const CSS_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openrouter/free",
  "z-ai/glm-4.5-air:free",
  "google/gemma-4-31b-it:free",
  "openrouter/auto",
];

// ─── Stage 4: Interaction Engine — JavaScript Layer ───────────────────────
//
// Primary: Nemotron 3 Super 120B — same model as CSS layer (sequential, no conflict).
//          Excellent logical reasoning for Intersection Observer, event handlers,
//          terminal simulators, and RPG stat systems.
// Fallback 1: Llama 3.3 70B — strong logical JS reasoning on free tier.
// Fallback 2: Qwen3 Coder — reliable code-first fallback for JS logic.
//
// NOTE: Never use openrouter/auto here. JS interactions are template-specific
//       and require precise, logical, zero-dependency vanilla JS output.

const JS_MODELS = [
  "qwen/qwen3-coder:free",
  "openrouter/free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openrouter/auto",
];

// ─── Update Workflow Routing ───────────────────────────────────────────────
//
// When the user edits an existing portfolio, route to the stage-appropriate
// model rather than always using the same Groq fallback.
//
//   Content edits  → Kimi K2    (rewrites text, messaging, headlines)
//   Layout edits   → Qwen3      (restructures HTML sections and grid)
//   Design edits   → Nemotron   (updates CSS, animations, color system)
//   JS edits       → Nemotron   (modifies interactions, counters, tabs)

// Edit Workflow: Route to stage registries first, with glm-5.1 as a last resort fallback
const CONTENT_EDIT_MODELS = [...BLUEPRINT_MODELS, "nvidia/z-ai/glm-5.1"];
const LAYOUT_EDIT_MODELS  = [...HTML_MODELS, "nvidia/z-ai/glm-5.1"];
const DESIGN_EDIT_MODELS  = [...CSS_MODELS, "nvidia/z-ai/glm-5.1"];
const JS_EDIT_MODELS      = [...JS_MODELS, "nvidia/z-ai/glm-5.1"];

/**
 * Selects the appropriate model list for a portfolio modification request.
 * Inspects the user's edit instruction to determine which stage is being targeted.
 *
 * @param {string} instruction - The user's modification prompt
 * @returns {string[]} - Ordered model list for that edit type
 */
const selectModelsForEditType = (instruction = "") => {
  const text = instruction.toLowerCase();

  // JS/interaction keywords
  if (
    text.includes("animation") || text.includes("scroll") || text.includes("click") ||
    text.includes("hover") || text.includes("menu") || text.includes("toggle") ||
    text.includes("counter") || text.includes("tab") || text.includes("filter") ||
    text.includes("interactive") || text.includes("javascript") || text.includes("behavior")
  ) {
    console.log("[EditRouter] → JS_EDIT_MODELS (Nemotron Super)");
    return JS_EDIT_MODELS;
  }

  // Design/visual keywords
  if (
    text.includes("color") || text.includes("style") || text.includes("font") ||
    text.includes("gradient") || text.includes("shadow") || text.includes("glow") ||
    text.includes("dark") || text.includes("light") || text.includes("theme") ||
    text.includes("spacing") || text.includes("padding") || text.includes("margin") ||
    text.includes("design") || text.includes("visual") || text.includes("css") ||
    text.includes("background") || text.includes("border")
  ) {
    console.log("[EditRouter] → DESIGN_EDIT_MODELS (Nemotron Super)");
    return DESIGN_EDIT_MODELS;
  }

  // Layout/structure keywords
  if (
    text.includes("layout") || text.includes("section") || text.includes("grid") ||
    text.includes("column") || text.includes("row") || text.includes("flex") ||
    text.includes("navbar") || text.includes("footer") || text.includes("hero") ||
    text.includes("move") || text.includes("reorder") || text.includes("structure")
  ) {
    console.log("[EditRouter] → LAYOUT_EDIT_MODELS (Qwen3 Coder)");
    return LAYOUT_EDIT_MODELS;
  }

  // Default: content edits (text, copy, messaging changes)
  console.log("[EditRouter] → CONTENT_EDIT_MODELS (Kimi K2.6) [default]");
  return CONTENT_EDIT_MODELS;
};

// ─── Model Health & Cooldown Tracking ────────────────────────────────────────

// Model Health & Cooldown Tracking – now scoped per API key
// Key: `${model}:${apiKey}` → timestamp when cooldown expires
const modelCooldowns = new Map();
const COOLDOWN_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const getCooldownKey = (model) => `${model}:${process.env.OPENROUTER_API_KEY || ''}`;

const registerModelFailure = (model) => {
  const expiresAt = Date.now() + COOLDOWN_DURATION_MS;
  const key = getCooldownKey(model);
  modelCooldowns.set(key, expiresAt);
  console.log(`[ModelHealth] ⚠ ${model} on cooldown until ${new Date(expiresAt).toLocaleTimeString()}`);
};

const registerModelSuccess = (model) => {
  const key = getCooldownKey(model);
  if (modelCooldowns.has(key)) {
    modelCooldowns.delete(key);
    console.log(`[ModelHealth] ✓ ${model} healthy — cleared from cooldown.`);
  }
};

const getPrioritizedModelList = (originalList) => {
  const now = Date.now();
  const healthy = [];
  const coolingDown = [];

  for (const model of originalList) {
    const key = getCooldownKey(model);
    const cooldownUntil = modelCooldowns.get(key);
    if (cooldownUntil && now < cooldownUntil) {
      coolingDown.push(model);
    } else {
      healthy.push(model);
    }
  }

  if (coolingDown.length > 0) {
    console.log(`[ModelHealth] Bypassing cooling models: [${coolingDown.join(", ")}]`);
  }
  // Healthy models first, cooling-down models as ultimate backstops
  return [...healthy, ...coolingDown];
};

// ─── Core OpenRouter Caller ──────────────────────────────────────────────────

/**
 * Call OpenRouter with automatic model fallback and circuit-breaker health tracking.
 *
 * @param {Array}    messages          - OpenAI-style messages array
 * @param {Object}   options
 * @param {number}   options.maxTokens   - Max tokens (default: 2000)
 * @param {number}   options.temperature - Sampling temperature (default: 0.4)
 * @param {string[]} options.modelList   - Ordered model list (default: BLUEPRINT_MODELS)
 * @param {boolean}  options.jsonMode    - Request JSON output mode (default: true)
 * @returns {Promise<{content: string, model: string}>}
 */
const callOpenRouter = async (messages, options = {}) => {
  const {
    maxTokens = 2000,
    temperature = 0.4,
    modelList = BLUEPRINT_MODELS,
    jsonMode = true,
    layer = "Unknown",
  } = options;

  let lastError = null;

  // Reorder: healthy models first, cooling-down models at end as backstops
  const prioritizedModels = getPrioritizedModelList(modelList);

  for (const model of prioritizedModels) {
    const startTime = Date.now();
    let currentClient = null;
    let provider = "OpenRouter";
    let resolvedModel = model;

    try {
      if (model.startsWith("nvidia/") && !model.endsWith(":free")) {
        provider = "NVIDIA";
        resolvedModel = model.replace("nvidia/", "");
        currentClient = getNvidiaClient();
      } else {
        provider = "OpenRouter";
        if (model.startsWith("openrouter/")) {
          resolvedModel = model.replace("openrouter/", "");
        }
        currentClient = getOpenRouterClient();
      }

      console.log(`[${provider}] → Attempting: ${resolvedModel} (Layer: ${layer})`);

      const requestParams = {
        model: resolvedModel,
        messages,
        max_tokens: maxTokens,
        temperature,
      };

      // openrouter/auto and Claude models don't support response_format
      const skipJsonMode = resolvedModel === "auto" || resolvedModel === "openrouter/auto" || resolvedModel.startsWith("anthropic/");
      if (jsonMode && !skipJsonMode) {
        requestParams.response_format = { type: "json_object" };
      }

      const completion = await currentClient.chat.completions.create(requestParams, {
        timeout: 15000 // 15 seconds timeout
      });

      const content = completion.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from model.");
      }

      const durationMs = Date.now() - startTime;
      console.log(
        `[${provider}] ✓ Success: ${resolvedModel} | tokens: ${completion.usage?.total_tokens ?? "N/A"} | time: ${(durationMs / 1000).toFixed(2)}s`
      );

      // Track metric to Benchmark file and console
      logBenchmark({
        provider,
        model: resolvedModel,
        layer,
        durationMs,
        success: true,
        outputLength: content.length,
      });

      registerModelSuccess(model);
      return { content, model };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      console.warn(`[${provider}] ✗ ${resolvedModel} failed: ${err.message}`);
      lastError = err;

      // Track metric to Benchmark file and console
      logBenchmark({
        provider,
        model: resolvedModel,
        layer,
        durationMs,
        success: false,
        outputLength: 0,
        error: err,
      });

      const isRetryable =
        [429, 503, 404, 402, 502, 500].includes(err.status) ||
        err.message?.includes("rate") ||
        err.message?.includes("No endpoints") ||
        err.message?.includes("Provider returned error") ||
        err.message?.includes("API key");

      if (isRetryable) {
        registerModelFailure(model);
        console.warn(`[${provider}] Waiting 4s before next fallback...`);
        await new Promise((r) => setTimeout(r, 4000));
        continue;
      }

      // Configuration, local auth, or other non-retryable model errors
      // Register failure and immediately proceed to the next model in the fallback chain
      registerModelFailure(model);
      continue;
    }
  }

  // ─── Ultimate Groq Fallback Chain ─────────────────────────────────────────
  try {
    const getGroqClient = require("./groq");
    const groqClient = getGroqClient();
    if (groqClient) {
      console.warn(`[OpenRouter] All model options exhausted. Attempting Groq fallback...`);
      const groqModels = ["llama-3.3-70b-versatile", "mixtral-8x7b-32768", "llama-3.1-8b-instant"];

      for (const groqModel of groqModels) {
        const groqStartTime = Date.now();
        try {
          console.log(`[Groq] fallback → ${groqModel}`);

          const groqParams = {
            model: groqModel,
            messages,
            temperature,
            max_tokens: maxTokens,
          };

          if (jsonMode) {
            groqParams.response_format = { type: "json_object" };
          }

          const completion = await groqClient.chat.completions.create(groqParams);
          const content = completion.choices?.[0]?.message?.content;

          if (content) {
            const groqDurationMs = Date.now() - groqStartTime;
            logBenchmark({
              provider: "Groq",
              model: groqModel,
              layer,
              durationMs: groqDurationMs,
              success: true,
              outputLength: content.length,
            });
            console.log(`[Groq] ✓ fallback success: ${groqModel}`);
            return { content, model: `groq/${groqModel}` };
          }
        } catch (groqModelErr) {
          const groqDurationMs = Date.now() - groqStartTime;
          logBenchmark({
            provider: "Groq",
            model: groqModel,
            layer,
            durationMs: groqDurationMs,
            success: false,
            outputLength: 0,
            error: groqModelErr,
          });
          console.warn(`[Groq] ${groqModel} failed: ${groqModelErr.message}`);
        }
      }
    }
  } catch (groqErr) {
    console.error(`[Groq] client error: ${groqErr.message}`);
  }

  throw new Error(
    `All available provider options exhausted. Last error: ${lastError?.message}`
  );
};

module.exports = {
  callOpenRouter,
  // Stage model lists
  BLUEPRINT_MODELS,
  HTML_MODELS,
  // Update workflow routing
  CONTENT_EDIT_MODELS,
  LAYOUT_EDIT_MODELS,
  DESIGN_EDIT_MODELS,
  JS_EDIT_MODELS,
  selectModelsForEditType,
};
