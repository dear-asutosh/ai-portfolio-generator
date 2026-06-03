const User = require('../models/User');
const Project = require('../models/Project');
const Subscription = require('../models/Subscription');
const { reactivatePortfolios } = require('../services/portfolioLifecycle');

// 1. Get Admin Dashboard Aggregated Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        
        // Users count by plan
        const freeUsers = await User.countDocuments({ plan: 'free' });
        const proUsers = await User.countDocuments({ plan: 'pro' });
        const lifetimeUsers = await User.countDocuments({ plan: 'lifetime' });

        // Portfolios count
        const totalLive = await Project.countDocuments({ status: 'Live' });
        const totalArchived = await Project.countDocuments({ status: 'Archived' });
        const totalDrafts = await Project.countDocuments({ status: 'Draft' });

        // Sum of all successful payments
        const revenueAggregation = await Subscription.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalRevenuePaise = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;
        const totalRevenue = totalRevenuePaise / 100; // convert to INR

        res.status(200).json({
            users: {
                total: totalUsers,
                free: freeUsers,
                pro: proUsers,
                lifetime: lifetimeUsers
            },
            portfolios: {
                live: totalLive,
                archived: totalArchived,
                draft: totalDrafts
            },
            revenue: {
                total: totalRevenue,
                currency: 'INR'
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Get Users with Pagination, Filtering, and Search
exports.getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const plan = req.query.plan || '';

        // Build match filters
        const match = {};
        if (plan) {
            match.plan = plan;
        }

        if (search) {
            match.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Count total users matching criteria
        const totalMatching = await User.countDocuments(match);

        // Aggregate user lists with portfolio counts
        const users = await User.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: 'projects',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'portfolios'
                }
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    role: 1,
                    plan: 1,
                    createdAt: 1,
                    subscription: 1,
                    activePortfoliosCount: {
                        $size: {
                            $filter: {
                                input: '$portfolios',
                                as: 'p',
                                cond: { $eq: ['$$p.status', 'Live'] }
                            }
                        }
                    },
                    archivedPortfoliosCount: {
                        $size: {
                            $filter: {
                                input: '$portfolios',
                                as: 'p',
                                cond: { $eq: ['$$p.status', 'Archived'] }
                            }
                        }
                    }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);

        res.status(200).json({
            users,
            pagination: {
                total: totalMatching,
                page,
                limit,
                pages: Math.ceil(totalMatching / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Get Detailed User Profile + Projects + Billing History
exports.getUserDetail = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const portfolios = await Project.find({ user: userId }).select('title slug status views hostingExpiresAt createdAt updatedAt');
        const subscriptions = await Subscription.find({ user: userId }).sort({ createdAt: -1 });

        res.status(200).json({
            user,
            portfolios,
            payments: subscriptions
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Update User Plan (Admin override)
exports.updateUserPlan = async (req, res) => {
    try {
        const userId = req.params.id;
        const { plan } = req.body;

        if (!['free', 'pro', 'lifetime'].includes(plan)) {
            return res.status(400).json({ error: 'Invalid plan name' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const oldPlan = user.plan;
        user.plan = plan;
        user.planUpdatedAt = new Date();

        if (plan === 'free') {
            user.subscription = {
                status: 'expired',
                currentPeriodEnd: null,
                gracePeriodEnd: null
            };

            // Set all active portfolios to expire in 30 days (downgrade grace period)
            const activeProjects = await Project.find({ user: userId, status: 'Live' });
            const graceEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days grace
            for (const project of activeProjects) {
                project.hostingExpiresAt = graceEnd;
                project.archivedReason = 'plan_downgrade';
                await project.save();
            }
        } else {
            // Upgrade user
            user.subscription = {
                status: 'active',
                currentPeriodStart: new Date(),
                currentPeriodEnd: plan === 'pro' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
                gracePeriodEnd: null
            };
        }

        await user.save();

        if (plan !== 'free') {
            // Reactivate archived portfolios under new limits
            await reactivatePortfolios(userId, plan);
        }

        res.status(200).json({
            success: true,
            plan: user.plan,
            message: `User plan successfully updated from ${oldPlan} to ${plan}.`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
