const express = require('express');
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getPublicProject,
    getPublicProjectByUserAndSlug,
    exportProjectCode
} = require('../controllers/projectController');

const router = express.Router();

// Public routes (unauthenticated)
router.get('/public/:id', getPublicProject);
router.get('/public/user/:username', getPublicProjectByUserAndSlug);
router.get('/public/user/:username/:slug', getPublicProjectByUserAndSlug);

const { protect } = require('../middleware/authMiddleware');
const { checkPortfolioLimit, checkTotalPortfolioLimit, checkExportAccess } = require('../middleware/planMiddleware');
const Project = require('../models/Project');

// All remaining routes are protected
router.use(protect);

router
    .route('/')
    .get(getProjects)
    .post(checkTotalPortfolioLimit, createProject);

router
    .route('/:id')
    .get(getProject)
    .put(checkPortfolioLimit, updateProject)
    .delete(deleteProject);

router.get('/:id/export', checkExportAccess, exportProjectCode);

/**
 * GET /api/projects/:id/phase
 * Lightweight polling endpoint for generation phase tracking.
 * The client polls this every 1.5s during portfolio generation to update
 * the cinematic preview loading UI.
 * Returns only { generationPhase } to minimize response size.
 */
router.get('/:id/phase', async (req, res) => {
    try {
        const project = await Project.findOne(
            { _id: req.params.id, user: req.user.id },
            { generationPhase: 1, generatedCode: 1 }  // Fetch phase and intermediate code
        );
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }
        return res.json({ 
            success: true, 
            generationPhase: project.generationPhase,
            generatedCode: project.generatedCode
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

