const Project = require('../models/Project');

// Count total portfolios (Draft + Live + Archived) and block creation if limit reached
exports.checkTotalPortfolioLimit = async (req, res, next) => {
    try {
        const userPlan = req.user.plan || 'free';
        
        // Define limits
        const limits = {
            free: 1,
            pro: 5,
            lifetime: Infinity
        };

        const maxAllowed = limits[userPlan];
        if (maxAllowed === Infinity) {
            return next();
        }

        // Count current total portfolios for user
        const totalCount = await Project.countDocuments({
            user: req.user._id
        });

        if (totalCount >= maxAllowed) {
            return res.status(403).json({
                error: `Creation blocked. You are on the ${userPlan.toUpperCase()} plan which allows a maximum of ${maxAllowed} total portfolio(s) in your account. Please delete an existing portfolio or upgrade to create a new one.`,
                plan: userPlan,
                limit: maxAllowed,
                current: totalCount,
                upgradeOptions: [
                    { plan: 'pro', price: '₹199/month', portfolios: 5 },
                    { plan: 'lifetime', price: '₹999 one-time', portfolios: 'Unlimited' }
                ]
            });
        }

        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Count active (Live) portfolios and block if limit reached
exports.checkPortfolioLimit = async (req, res, next) => {
    try {
        const userPlan = req.user.plan || 'free';
        
        // Define limits
        const limits = {
            free: 1,
            pro: 5,
            lifetime: Infinity
        };

        const maxAllowed = limits[userPlan];
        if (maxAllowed === Infinity) {
            return next();
        }

        // Count current live portfolios for user
        const query = {
            user: req.user._id,
            status: 'Live'
        };

        // If updating an existing project, exclude it from the count
        if (req.params.id) {
            query._id = { $ne: req.params.id };
        }

        const activeCount = await Project.countDocuments(query);

        if (activeCount >= maxAllowed) {
            return res.status(403).json({
                error: `Limit exceeded. You are on the ${userPlan.toUpperCase()} plan which allows a maximum of ${maxAllowed} active portfolio(s).`,
                plan: userPlan,
                limit: maxAllowed,
                current: activeCount,
                upgradeOptions: [
                    { plan: 'pro', price: '₹199/month', portfolios: 5 },
                    { plan: 'lifetime', price: '₹999 one-time', portfolios: 'Unlimited' }
                ]
            });
        }

        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Check if user has source code export access (Pro and Lifetime only)
exports.checkExportAccess = (req, res, next) => {
    const userPlan = req.user.plan || 'free';
    
    if (userPlan === 'free') {
        return res.status(403).json({
            error: 'Upgrade to Pro or Lifetime to export your portfolio source code.',
            plan: userPlan
        });
    }
    
    next();
};

// Require a specific plan or set of plans
exports.requirePlan = (allowedPlans) => {
    return (req, res, next) => {
        const userPlan = req.user.plan || 'free';
        
        if (!allowedPlans.includes(userPlan)) {
            return res.status(403).json({
                error: `Access denied. This feature is only available for ${allowedPlans.join('/')} plans.`
            });
        }
        
        next();
    };
};
