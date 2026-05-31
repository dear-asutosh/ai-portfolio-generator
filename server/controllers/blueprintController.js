/**
 * Blueprint Controller — Unified Portfolio Design Strategy Layer
 *
 * Implements Stage 1 of the Profilio generation engine.
 * Receives UserProfile JSON and compiles a customized PortfolioBlueprint JSON
 * that instructs subsequent code generators exactly how to present the profile
 * using the Profilio Design System V1 (Modern Dark Developer style).
 *
 * YOU ARE NOT GENERATING HTML, CSS, OR JAVASCRIPT here.
 * YOU ARE ONLY GENERATING A STRUCTURED JSON BLUEPRINT.
 */

const { callOpenRouter, BLUEPRINT_MODELS } = require("../config/openrouter");
const { validatePortfolioBlueprint } = require("./blueprintValidator");

// ─── Design System Baseline ──────────────────────────────────────────────────

const GLOBAL_PORTFOLIO_RULES = `
You are Profilio's Portfolio Generation Engine.

MISSION:
Generate a premium, production-ready portfolio website that feels handcrafted,
modern, fully responsive, and deeply tailored to the specific user.

NON-NEGOTIABLE REQUIREMENTS:

RESPONSIVENESS:
- Mobile-first. Fully responsive on mobile, tablet, laptop, desktop, ultra-wide.
- No horizontal scrolling at any breakpoint.
- Proper fluid typography and responsive spacing throughout.

NAVIGATION:
- Sticky navigation bar pinned to the top.
- Clean minimalist navbar design that does not compete with content.
- Mobile hamburger menu with smooth open/close animation.
- Auto-close menu after a navigation link is clicked.
- Active section highlighting as the user scrolls.
- Fully keyboard accessible (focus states, escape key closes menu).

LAYOUT:
- Strong, intentional visual hierarchy on every section.
- Consistent spacing system — do not mix random margin/padding values.
- Consistent border-radius language throughout the whole page.
- Consistent shadow language — pick one elevation scale and stick to it.
- Every section must have one clear focal point that draws the eye.

PORTFOLIO QUALITY:
- Avoid generic, template-looking section layouts.
- Avoid repetitive card designs across sections.
- Avoid walls of text — break content into digestible visual chunks.
- Projects must feel important and well-presented, never an afterthought.
- Hero must create immediate impact in the first 3 seconds.

CONTENT STRATEGY:
- Showcase outcomes before technologies used.
- Showcase achievements before responsibilities.
- Showcase credibility signals before self-promotion.

ANIMATIONS:
- Purposeful only — every animation must serve communication, not decoration.
- Performance-friendly — prefer CSS transitions over JavaScript where possible.
- No excessive motion — respect user comfort and accessibility.

CONSISTENCY:
- Never mix different visual styles — maintain a unified dark-theme visual rhythm.
- Build design layouts that are extremely premium and pixel-perfect.

REFERENCE QUALITY BAR:
Aim for the quality level of design seen at:
Linear, Stripe, Vercel, Framer, Raycast, Awwwards winners.
`.trim();

const DESIGN_SYSTEM_CAPABILITIES = {
  personality:
    "Premium developer portfolio focused on technical authority and modern engineering aesthetics. " +
    "Dark slate background with cyan/emerald accents, bento-grid inspired layouts, and Awwwards-level " +
    "micro-interactions. Targets software engineers, full-stack developers, and tech professionals.",
  sections: {
    required: ["hero", "skills", "projects", "contact"],
    optional: ["experience", "education", "stats"],
  },
  visualOptions: {
    animationIntensity: ["subtle", "premium", "immersive"],
    typographyPersonality: ["futuristic-tech", "bold-modern", "minimalist"],
    spacingStyle: ["compact", "balanced", "airy"],
    ctaStyle: ["glowing", "gradient", "glassmorphism"],
    cardDensity: ["compact", "balanced"],
    projectPresentation: ["bento-grid", "card-list", "spotlight"],
  },
  colorPalette: {
    base: "slate-950",
    accent1: "cyan-400",
    accent2: "emerald-400",
    highlight: "indigo-400",
  },
  defaultMood: "technical",
  designReferences: ["Linear", "Vercel", "Stripe", "Raycast", "Planetscale"],
  designPrinciples: [
    "Projects over skills — lead with what was built and its impact",
    "Credibility over buzzwords — show proof, not claims",
    "Hierarchy over decoration — every element earns its space",
    "Technical authority first — the user must feel expert within 3 seconds",
    "Minimal but premium — restraint amplifies quality",
  ],
  antiPatterns: [
    "Generic hero with 'Hi, I am a developer' opener",
    "Flat skill icon grid with no context",
    "Wall-of-text project descriptions",
    "Template-looking 3-column card grid",
    "Repetitive card designs across sections",
    "Centered layout for everything",
    "Rainbow skill badges",
  ],
  sectionPriority: {
    hero: 10,
    projects: 10,
    experience: 9,
    skills: 8,
    contact: 7,
    education: 5,
  },
  aiInstructions: `
Generate a premium software engineer portfolio with technical authority and modern SaaS aesthetics.

VISUAL STYLE:
- Dark luxury aesthetic — deep slate/charcoal base, not flat black.
- Bento-grid inspired layouts for projects and skills.
- Glassmorphism cards with subtle border glow on hover.
- Cyan and emerald accent colors used sparingly for maximum impact.
- Premium micro-interactions: hover lift, glow spread, subtle parallax.

HERO SECTION:
- Establish authority immediately — lead with a strong title and impact statement.
- Include a concise tagline that describes what the user builds, not who they are.
- Avoid "Hi, I am..." openings — start with what makes this person worth hiring.
- CTA should be action-oriented: "See My Work" or "View Projects".

PROJECTS SECTION:
- Most important section — give it the most visual real estate.
- Feature the top project in a spotlight card (wider, more prominent).
- Show measurable outcomes: "Reduced load time by 60%", not "Built a fast app".
- Include tech stack as subtle tags, never the headline.
- Links to live demo and GitHub should be clearly visible.

SKILLS SECTION:
- Avoid plain icon grids — use grouped skill clusters with visual hierarchy.
- Group by domain: Frontend, Backend, DevOps, Cloud, etc.
- Consider animated progress or proficiency indicators.

EXPERIENCE SECTION:
- Achievement-focused bullet points — outcomes, not duties.
- Show progression and growth across roles.
- Company names and dates as supporting context, not the headline.

FINAL FEELING:
Should feel like the portfolio of an engineer at Google, Stripe, Vercel, or Linear.
Technically impressive. Clean. Authoritative. Premium.
  `.trim(),
};

// ─── JSON Cleanup Utility ───────────────────────────────────────────────────

const cleanAndParseJSON = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    let cleaned = str.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    return JSON.parse(cleaned.trim());
  }
};

// ─── Blueprint Validation & Merge ───────────────────────────────────────────

const validateBlueprint = (blueprint) => {
  const defaults = {
    portfolioTone: "professional",
    heroSection: {
      headline: "Building things that matter.",
      subheadline: "Developer, problem solver, and lifelong learner.",
      ctaText: "See My Work",
      heroStyle: "centered",
    },
    sectionStrategy: DESIGN_SYSTEM_CAPABILITIES.sections.required.map((s, i) => ({
      section: s,
      priority: i === 0 ? "high" : "medium",
      visibility: "visible",
    })),
    contentEmphasis: {
      primaryFocus: "projects",
      secondaryFocus: "skills",
    },
    visualPersonalization: {
      animationIntensity: "subtle",
      typographyPersonality: "bold-modern",
      spacingStyle: "balanced",
      ctaStyle: "gradient",
      cardDensity: "balanced",
      projectPresentation: "bento-grid",
    },
    themeTweaks: {
      primaryAccent: DESIGN_SYSTEM_CAPABILITIES.colorPalette.accent1,
      secondaryAccent: DESIGN_SYSTEM_CAPABILITIES.colorPalette.accent2,
      highlightStyle: "subtle-glow",
    },
    portfolioStorytelling: {
      style: "achievement-led",
      userPerceptionGoal: "A skilled professional worth hiring",
    },
    uiEnhancements: ["smooth-scroll", "section-reveal-animations"],
  };

  // Deep merge: use blueprint values where present, fall back to defaults
  const merged = {
    portfolioTone: blueprint.portfolioTone || defaults.portfolioTone,
    heroSection: { ...defaults.heroSection, ...(blueprint.heroSection || {}) },
    sectionStrategy:
      blueprint.sectionStrategy?.length > 0
        ? blueprint.sectionStrategy
        : defaults.sectionStrategy,
    contentEmphasis: { ...defaults.contentEmphasis, ...(blueprint.contentEmphasis || {}) },
    visualPersonalization: {
      ...defaults.visualPersonalization,
      ...(blueprint.visualPersonalization || {}),
    },
    themeTweaks: { ...defaults.themeTweaks, ...(blueprint.themeTweaks || {}) },
    portfolioStorytelling: {
      ...defaults.portfolioStorytelling,
      ...(blueprint.portfolioStorytelling || {}),
    },
    uiEnhancements: blueprint.uiEnhancements?.length > 0
      ? blueprint.uiEnhancements
      : defaults.uiEnhancements,
  };

  return merged;
};

// ─── System Prompt Builder ──────────────────────────────────────────────────

const buildBlueprintSystemPrompt = () => `
You are an expert AI portfolio strategist and premium UI personalization engine.

Your task is to analyze a user's professional profile and generate a structured
PortfolioBlueprint JSON that describes how to customize a portfolio.

YOU ARE NOT GENERATING HTML, CSS, OR JAVASCRIPT.
YOU ARE ONLY GENERATING A STRUCTURED JSON BLUEPRINT.

The blueprint will be used by a separate code generation layer to produce the final portfolio.

-----------------------------------
GLOBAL PORTFOLIO QUALITY RULES
-----------------------------------
${GLOBAL_PORTFOLIO_RULES}

-----------------------------------
BLUEPRINT RULES
-----------------------------------
1. ONLY return valid JSON. No markdown, no backticks, no extra text.
2. DO NOT generate code of any kind.
3. Make decisions that are specific to this user — avoid generic choices.
4. Match decisions strictly to the design system's aesthetic and capabilities.
5. Enforce the GLOBAL PORTFOLIO QUALITY RULES in every decision you make.
6. Hero messaging must feel personal and powerful — not generic.
7. Section ordering should reflect what makes THIS user look most impressive.
8. Apply the design system's antiPatterns list — never make those choices.
9. Use the design system's sectionPriority to decide which sections to emphasize.
`.trim();

// ─── User Prompt Builder ────────────────────────────────────────────────────

const buildBlueprintUserPrompt = (userProfile) => {
  const profession = userProfile.personalInfo?.targetRole
    || userProfile.personalInfo?.currentRole
    || deriveRoleFromSkills(userProfile.skills);

  const topProjects = (userProfile.projects || []).slice(0, 3).map(p => p.title).join(", ");
  const topSkills = (userProfile.skills || []).slice(0, 8).join(", ");
  const yearsExp = estimateYearsOfExperience(userProfile.experience);

  return `
-----------------------------------
USER PROFILE JSON
-----------------------------------
${JSON.stringify(userProfile, null, 2)}

-----------------------------------
DERIVED PROFESSIONAL SIGNALS
-----------------------------------
Estimated Role: ${profession}
Top Skills: ${topSkills}
Top Projects: ${topProjects}
Experience Level: ${yearsExp}

-----------------------------------
TARGET PORTFOLIO DESIGN SYSTEM: PROFILIO DESIGN SYSTEM V1
-----------------------------------
This design system represents a modern dark developer portfolio theme.

DESIGN SYSTEM PERSONALITY:
${DESIGN_SYSTEM_CAPABILITIES.personality}

DESIGN SYSTEM CAPABILITIES:
Required Sections: ${DESIGN_SYSTEM_CAPABILITIES.sections.required.join(", ")}
Optional Sections: ${DESIGN_SYSTEM_CAPABILITIES.sections.optional.join(", ")}

Available Animation Intensity: ${DESIGN_SYSTEM_CAPABILITIES.visualOptions.animationIntensity.join(", ")}
Available Typography: ${DESIGN_SYSTEM_CAPABILITIES.visualOptions.typographyPersonality.join(", ")}
Available Spacing: ${DESIGN_SYSTEM_CAPABILITIES.visualOptions.spacingStyle.join(", ")}
Available CTA Styles: ${DESIGN_SYSTEM_CAPABILITIES.visualOptions.ctaStyle.join(", ")}
Available Card Density: ${DESIGN_SYSTEM_CAPABILITIES.visualOptions.cardDensity.join(", ")}
Available Project Presentation: ${DESIGN_SYSTEM_CAPABILITIES.visualOptions.projectPresentation.join(", ")}

Default Color Palette: ${JSON.stringify(DESIGN_SYSTEM_CAPABILITIES.colorPalette)}
Design System Mood: ${DESIGN_SYSTEM_CAPABILITIES.defaultMood}

-----------------------------------
DESIGN REFERENCES
-----------------------------------
${(DESIGN_SYSTEM_CAPABILITIES.designReferences || []).join(", ")}

-----------------------------------
DESIGN PRINCIPLES (FOLLOW THESE)
-----------------------------------
${(DESIGN_SYSTEM_CAPABILITIES.designPrinciples || []).map((p, i) => `${i + 1}. ${p}`).join("\n")}

-----------------------------------
ANTI-PATTERNS (NEVER DO THESE)
-----------------------------------
${(DESIGN_SYSTEM_CAPABILITIES.antiPatterns || []).map((p, i) => `${i + 1}. ${p}`).join("\n")}

-----------------------------------
SECTION PRIORITY (Higher = More Emphasis)
-----------------------------------
${Object.entries(DESIGN_SYSTEM_CAPABILITIES.sectionPriority || {}).map(([k, v]) => `${k}: ${v}/10`).join("\n")}

-----------------------------------
DESIGN SYSTEM AI INSTRUCTIONS
-----------------------------------
${DESIGN_SYSTEM_CAPABILITIES.aiInstructions}

-----------------------------------
PERSONALIZATION OPTIONS REFERENCE
-----------------------------------
Animation Intensity: minimal | subtle | premium | immersive
Content Tone: professional | futuristic | creative | technical | minimalist | startup-like
Project Emphasis: strong | balanced | lightweight
Typography Personality: bold-modern | elegant-clean | futuristic-tech | editorial | minimalist
Spacing Style: compact | balanced | airy | luxury
CTA Style: glowing | clean-outline | gradient | glassmorphism

-----------------------------------
REQUIRED OUTPUT FORMAT
-----------------------------------
Return exactly this JSON structure. Only use values valid for this design system's capabilities.

{
  "portfolioTone": "",

  "heroSection": {
    "headline": "",
    "subheadline": "",
    "ctaText": "",
    "heroStyle": ""
  },

  "sectionStrategy": [
    {
      "section": "",
      "priority": "high | medium | low",
      "visibility": "visible | hidden"
    }
  ],

  "contentEmphasis": {
    "primaryFocus": "",
    "secondaryFocus": ""
  },

  "visualPersonalization": {
    "animationIntensity": "",
    "typographyPersonality": "",
    "spacingStyle": "",
    "ctaStyle": "",
    "cardDensity": "",
    "projectPresentation": ""
  },

  "themeTweaks": {
    "primaryAccent": "",
    "secondaryAccent": "",
    "highlightStyle": ""
  },

  "portfolioStorytelling": {
    "style": "",
    "userPerceptionGoal": ""
  },

  "uiEnhancements": [
    "",
    ""
  ]
}
`.trim();
};

// ─── Helper Utilities ───────────────────────────────────────────────────────

const deriveRoleFromSkills = (skills = []) => {
  const normalized = skills.map((s) => s.toLowerCase()).join(" ");
  if (normalized.includes("react") || normalized.includes("vue") || normalized.includes("angular"))
    return "Frontend Developer";
  if (normalized.includes("node") || normalized.includes("express") || normalized.includes("django"))
    return "Backend Developer";
  if (normalized.includes("figma") || normalized.includes("sketch") || normalized.includes("ux"))
    return "UI/UX Designer";
  if (normalized.includes("machine learning") || normalized.includes("pytorch") || normalized.includes("tensorflow"))
    return "ML Engineer";
  if (normalized.includes("cyber") || normalized.includes("penetration") || normalized.includes("kali"))
    return "Cybersecurity Engineer";
  return "Software Professional";
};

const estimateYearsOfExperience = (experience = []) => {
  if (!experience || experience.length === 0) return "entry-level";
  if (experience.length >= 4) return "senior (5+ years)";
  if (experience.length >= 2) return "mid-level (2-4 years)";
  return "junior (0-2 years)";
};

// ─── Main Controller Functions ──────────────────────────────────────────────

/**
 * @desc    Generate a PortfolioBlueprint JSON from user profile using unified design system
 * @route   POST /api/ai/generate-blueprint
 * @access  Private
 */
exports.generateBlueprint = async (req, res) => {
  try {
    const { userProfile } = req.body;

    if (!userProfile) {
      return res.status(400).json({
        success: false,
        message: "userProfile is required.",
      });
    }

    console.log(`[Stage 1 — Content Planning] Generating blueprint for Profilio Design System V1 via Kimi K2.6...`);

    const messages = [
      { role: "system", content: buildBlueprintSystemPrompt() },
      { role: "user", content: buildBlueprintUserPrompt(userProfile) },
    ];

    const { content, model } = await callOpenRouter(messages, {
      maxTokens: 2500,
      temperature: 0.4,
      modelList: BLUEPRINT_MODELS,
      layer: "Blueprint",
    });

    let rawBlueprint;
    try {
      rawBlueprint = cleanAndParseJSON(content);
    } catch (parseError) {
      console.error("[Blueprint] Failed to parse AI response:", parseError.message);
      console.error("[Blueprint] Raw content:", content);
      return res.status(500).json({
        success: false,
        message: "Blueprint generation succeeded but response was malformed.",
        error: parseError.message,
      });
    }

    // Validate and fill defaults
    const blueprint = validateBlueprint(rawBlueprint);

    console.log(`[Stage 1 — Content Planning] ✓ Blueprint ready via ${model}`);

    return res.status(200).json({
      success: true,
      blueprint,
      meta: {
        model,
        designSystem: "Profilio Design System V1",
      },
    });
  } catch (error) {
    console.error("[Blueprint] Critical error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to generate portfolio blueprint.",
      error: error.message,
    });
  }
};

/**
 * Programmatic blueprint generator — called internally by aiController
 * (not directly via HTTP). Returns the blueprint object directly.
 *
 * @param {Object} userProfile - Structured user profile JSON
 * @returns {Promise<Object>} - { blueprint, model, designSystemCapabilities }
 */
exports.generateBlueprintInternal = async (userProfile) => {
  console.log(`[Stage 1 — Content Planning] Internal blueprint for Profilio Design System V1 via Kimi K2.6...`);

  const messages = [
    { role: "system", content: buildBlueprintSystemPrompt() },
    {
      role: "user",
      content: buildBlueprintUserPrompt(userProfile),
    },
  ];

  const { content, model } = await callOpenRouter(messages, {
    maxTokens: 2500,
    temperature: 0.4,
    modelList: BLUEPRINT_MODELS,
    layer: "Blueprint",
  });

  const rawBlueprint = cleanAndParseJSON(content);
  const blueprint = validateBlueprint(rawBlueprint);

  console.log(`[Stage 1 — Content Planning] ✓ Blueprint ready (model: ${model})`);
  return { blueprint, model, designSystemCapabilities: DESIGN_SYSTEM_CAPABILITIES };
};

module.exports.DESIGN_SYSTEM_CAPABILITIES = DESIGN_SYSTEM_CAPABILITIES;
