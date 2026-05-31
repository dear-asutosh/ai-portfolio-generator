const express = require("express");
const router = express.Router();
const multer = require("multer");
const { parseResume, generatePortfolioData, suggestImprovements, initializePortfolio, modifyPortfolioCode, regenerateSection } = require("../controllers/aiController");
const { generateBlueprint } = require("../controllers/blueprintController");
const { protect } = require("../middleware/authMiddleware");

// Multer config for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// All AI routes are protected
router.post("/parse-resume", protect, upload.single("resume"), parseResume);
router.post("/generate-data", protect, generatePortfolioData);
router.post("/suggest", protect, suggestImprovements);
router.post("/initialize-portfolio", protect, initializePortfolio);
router.post("/modify-portfolio", protect, modifyPortfolioCode);

// Template Intelligence Layer — standalone blueprint endpoint
// Useful for client-side "personalization preview" before code generation
router.post("/generate-blueprint", protect, generateBlueprint);

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



