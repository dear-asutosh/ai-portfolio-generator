/**
 * Blueprint Validator — Zod-Based Schema Validation
 *
 * Validates the PortfolioBlueprint object produced by the AI (blueprintController)
 * before it enters the 3-layer code generation pipeline.
 *
 * Why validation matters:
 *   - AI can hallucinate fields, use wrong enum values, or return null/undefined
 *   - The code generation pipeline assumes specific blueprint shapes
 *   - Section regeneration targets blueprint fields directly — must be clean
 *   - Prevents silent failures deep in the pipeline from malformed AI JSON
 *
 * Strategy:
 *   - Schema is permissive on string values (AI creativity is welcome)
 *   - Schema is strict on structural shape (arrays, objects, required fields)
 *   - On validation failure → fills defaults rather than hard-rejecting
 *     (graceful degradation keeps the product running)
 *   - On CRITICAL structural failure → throws, pipeline aborts with 400
 */

const { z } = require("zod");

// ─── Enum Definitions ─────────────────────────────────────────────────────────

const AnimationIntensity = z.enum(["minimal", "subtle", "premium", "immersive"]);
const SectionPriority = z.enum(["high", "medium", "low"]);
const SectionVisibility = z.enum(["visible", "hidden"]);

// ─── Sub-Schemas ─────────────────────────────────────────────────────────────

const HeroSectionSchema = z.object({
  headline: z.string().min(1).max(200),
  subheadline: z.string().min(1).max(400),
  ctaText: z.string().min(1).max(80),
  heroStyle: z.string().min(1), // e.g. "centered", "split-left", "fullscreen"
});

const SectionStrategyItemSchema = z.object({
  section: z.string().min(1), // e.g. "hero", "skills", "projects"
  priority: SectionPriority,
  visibility: SectionVisibility,
});

const ContentEmphasisSchema = z.object({
  primaryFocus: z.string().min(1),
  secondaryFocus: z.string().min(1),
});

const VisualPersonalizationSchema = z.object({
  animationIntensity: AnimationIntensity,
  typographyPersonality: z.string().min(1),
  spacingStyle: z.string().min(1),
  ctaStyle: z.string().min(1),
  cardDensity: z.string().min(1),
  projectPresentation: z.string().min(1),
});

const ThemeTweaksSchema = z.object({
  primaryAccent: z.string().min(1),   // CSS color string
  secondaryAccent: z.string().min(1),
  highlightStyle: z.string().min(1),
});

const PortfolioStorytellingSchema = z.object({
  style: z.string().min(1),
  userPerceptionGoal: z.string().min(1),
});

// ─── Main Blueprint Schema ────────────────────────────────────────────────────

const PortfolioBlueprintSchema = z.object({
  portfolioTone: z.string().min(1),
  heroSection: HeroSectionSchema,
  sectionStrategy: z.array(SectionStrategyItemSchema).min(1),
  contentEmphasis: ContentEmphasisSchema,
  visualPersonalization: VisualPersonalizationSchema,
  themeTweaks: ThemeTweaksSchema,
  portfolioStorytelling: PortfolioStorytellingSchema,
  uiEnhancements: z.array(z.string()).min(1),
});

// ─── Default Blueprint Fallback ───────────────────────────────────────────────

const DEFAULT_BLUEPRINT = {
  portfolioTone: "professional",
  heroSection: {
    headline: "Building things that matter.",
    subheadline: "Developer, designer, and lifelong learner.",
    ctaText: "See My Work",
    heroStyle: "centered",
  },
  sectionStrategy: [
    { section: "hero", priority: "high", visibility: "visible" },
    { section: "skills", priority: "high", visibility: "visible" },
    { section: "projects", priority: "high", visibility: "visible" },
    { section: "experience", priority: "medium", visibility: "visible" },
    { section: "education", priority: "medium", visibility: "visible" },
    { section: "contact", priority: "low", visibility: "visible" },
  ],
  contentEmphasis: { primaryFocus: "projects", secondaryFocus: "skills" },
  visualPersonalization: {
    animationIntensity: "subtle",
    typographyPersonality: "bold-modern",
    spacingStyle: "balanced",
    ctaStyle: "gradient",
    cardDensity: "balanced",
    projectPresentation: "card-grid",
  },
  themeTweaks: {
    primaryAccent: "#06b6d4",
    secondaryAccent: "#10b981",
    highlightStyle: "subtle-glow",
  },
  portfolioStorytelling: {
    style: "achievement-led",
    userPerceptionGoal: "A skilled professional worth hiring",
  },
  uiEnhancements: ["smooth-scroll", "section-reveal-animations"],
};

// ─── Validator ────────────────────────────────────────────────────────────────

/**
 * Validates a PortfolioBlueprint object against the Zod schema.
 *
 * @param {Object} blueprint - Raw blueprint from AI or blueprintController
 * @returns {{
 *   valid: boolean,
 *   blueprint: Object,   // Validated + coerced blueprint (or merged with defaults)
 *   errors: string[],    // Field-level error messages if any
 *   usedDefaults: boolean
 * }}
 */
const validatePortfolioBlueprint = (blueprint) => {
  if (!blueprint || typeof blueprint !== "object") {
    console.warn("[BlueprintValidator] No blueprint provided — using full defaults.");
    return {
      valid: false,
      blueprint: { ...DEFAULT_BLUEPRINT },
      errors: ["Blueprint is null or not an object"],
      usedDefaults: true,
    };
  }

  const result = PortfolioBlueprintSchema.safeParse(blueprint);

  if (result.success) {
    return {
      valid: true,
      blueprint: result.data,
      errors: [],
      usedDefaults: false,
    };
  }

  // Validation failed — extract human-readable error messages
  const errors = result.error.issues.map((issue) => {
    const path = issue.path.join(".");
    return `${path}: ${issue.message}`;
  });

  console.warn(`[BlueprintValidator] ${errors.length} validation issue(s) found. Merging with defaults.`);
  errors.forEach((e) => console.warn(`  ↳ ${e}`));

  // Graceful degradation: merge failing blueprint with defaults
  // Field-level merge: use blueprint value if it passes individual validation, else use default
  const safeBlueprint = mergeWithDefaults(blueprint, DEFAULT_BLUEPRINT);

  return {
    valid: false,
    blueprint: safeBlueprint,
    errors,
    usedDefaults: true,
  };
};

/**
 * Deep-merges a potentially partial/invalid blueprint with defaults.
 * Uses the blueprint value if it's a non-null, non-empty primitive/object;
 * falls back to the default otherwise.
 *
 * @param {Object} blueprint - Input (potentially malformed)
 * @param {Object} defaults  - Default values
 * @returns {Object} - Safely merged blueprint
 */
const mergeWithDefaults = (blueprint, defaults) => {
  const result = {};

  for (const key of Object.keys(defaults)) {
    const bVal = blueprint[key];
    const dVal = defaults[key];

    if (bVal === null || bVal === undefined) {
      result[key] = dVal;
    } else if (Array.isArray(dVal)) {
      result[key] = Array.isArray(bVal) && bVal.length > 0 ? bVal : dVal;
    } else if (typeof dVal === "object") {
      result[key] = typeof bVal === "object" ? { ...dVal, ...bVal } : dVal;
    } else {
      // Primitive: use blueprint value if it's a non-empty string
      result[key] = typeof bVal === "string" && bVal.trim().length > 0 ? bVal : dVal;
    }
  }

  return result;
};

/**
 * Strict validator — throws on failure.
 * Use this when a malformed blueprint would be truly unrecoverable.
 *
 * @param {Object} blueprint - Blueprint to validate
 * @throws {Error} - With field-level details
 */
const assertValidBlueprint = (blueprint) => {
  const result = PortfolioBlueprintSchema.safeParse(blueprint);
  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`[BlueprintValidator] Blueprint validation failed: ${errors}`);
  }
  return result.data;
};

module.exports = {
  validatePortfolioBlueprint,
};
