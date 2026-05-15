const express = require("express");
const router = express.Router();
const multer = require("multer");
const { parseResume, generatePortfolioData, suggestImprovements, initializePortfolio } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// Multer config for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// All AI routes are protected
router.post("/parse-resume", protect, upload.single("resume"), parseResume);
router.post("/generate-data", protect, generatePortfolioData);
router.post("/suggest", protect, suggestImprovements);
router.post("/initialize-portfolio", protect, initializePortfolio);


module.exports = router;

