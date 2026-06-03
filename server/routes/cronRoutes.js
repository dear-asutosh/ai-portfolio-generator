const express = require('express');
const router = express.Router();
const { archiveExpiredPortfolios } = require('../services/portfolioLifecycle');

// GET /api/cron/archive-expired
// Triggers periodic checks to archive portfolios with expired hosting
router.get('/archive-expired', async (req, res) => {
    try {
        const cronSecret = process.env.CRON_SECRET;
        
        // Check for CRON_SECRET authorization header
        if (cronSecret) {
            const authHeader = req.headers['authorization'];
            const expectedAuth = `Bearer ${cronSecret}`;
            
            if (authHeader !== expectedAuth) {
                return res.status(401).json({ error: 'Unauthorized. Invalid cron secret.' });
            }
        }
        
        const stats = await archiveExpiredPortfolios();
        
        res.status(200).json({
            success: true,
            message: 'Portfolios expiration check completed.',
            stats
        });
    } catch (err) {
        console.error('Cron archive-expired error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
