const express = require("express");
const router = express.Router();
const multer = require("multer");
const { parseResume, generatePortfolioData, suggestImprovements, initializePortfolio, modifyPortfolioCode, regenerateSection, importGitHubProfile } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// Multer config for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// All AI routes are protected
router.post("/parse-resume", protect, upload.single("resume"), parseResume);
router.post("/generate-data", protect, generatePortfolioData);
router.post("/import-github", protect, importGitHubProfile);
router.post("/suggest", protect, suggestImprovements);
router.post("/initialize-portfolio", protect, initializePortfolio);
router.post("/modify-portfolio", protect, modifyPortfolioCode);

// Template Intelligence Layer — standalone blueprint endpoint (backward-compatible static default)
router.post("/generate-blueprint", protect, (req, res) => {
  res.status(200).json({
    success: true,
    blueprint: {
      portfolioTone: "professional",
      heroSection: {
        headline: "Building things that matter.",
        subheadline: "Developer, problem solver, and lifelong learner.",
        ctaText: "See My Work",
        heroStyle: "centered"
      },
      visualPersonalization: {
        animationIntensity: "subtle",
        typographyPersonality: "bold-modern",
        spacingStyle: "balanced",
        ctaStyle: "gradient",
        cardDensity: "balanced",
        projectPresentation: "bento-grid"
      },
      themeTweaks: {
        primaryAccent: "cyan-400",
        secondaryAccent: "emerald-400",
        highlightStyle: "subtle-glow"
      }
    },
    meta: {
      designSystem: "Profilio Design System V1 (Static Default)"
    }
  });
});

/**
 * POST /api/ai/regenerate-section
 * Blueprint-driven section-level regeneration.
 * Updates blueprint fields to reflect user intent, then regenerates only
 * the targeted section — much faster and cheaper than full regeneration.
 *
 * Body: { projectId, section, instruction, blueprintMutations (optional) }
 */
router.post("/regenerate-section", protect, regenerateSection);


module.exports = router;



