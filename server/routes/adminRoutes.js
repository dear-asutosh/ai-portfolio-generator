const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');
const {
    getDashboardStats,
    getUsers,
    getUserDetail,
    updateUserPlan
} = require('../controllers/adminController');

// All routes require authentication AND admin role check
router.use(protect);
router.use(requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetail);
router.put('/users/:id/plan', updateUserPlan);

module.exports = router;
