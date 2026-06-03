const Project = require('../models/Project');
const User = require('../models/User');

// Launch date of pricing system (for migration grace period)
const PRICING_SYSTEM_LAUNCH_DATE = new Date('2026-06-03T17:32:26+05:30');
const MIGRATION_GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const PRO_GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Set the hosting expiration date for a portfolio based on user plan.
 * @param {Object} project - The project document
 * @param {String} userPlan - 'free', 'pro', or 'lifetime'
 * @param {Date} userCreatedAt - User creation date (for existing user check)
 */
exports.setHostingExpiration = (project, userPlan, userCreatedAt) => {
    if (userPlan === 'free') {
        const userCreated = userCreatedAt ? new Date(userCreatedAt) : new Date();
        const projectCreated = project.createdAt ? new Date(project.createdAt) : new Date();

        // Check if this is an existing portfolio/user (created before pricing system launch)
        if (projectCreated < PRICING_SYSTEM_LAUNCH_DATE || userCreated < PRICING_SYSTEM_LAUNCH_DATE) {
            // Grant 30 days migration grace period from launch date
            project.hostingExpiresAt = new Date(PRICING_SYSTEM_LAUNCH_DATE.getTime() + MIGRATION_GRACE_PERIOD_MS);
        } else {
            // New free portfolios get 7 days from creation/activation
            project.hostingExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
    } else {
        // Pro and Lifetime have unlimited hosting duration (Pro depends on subscription status)
        project.hostingExpiresAt = null;
    }
    project.archivedAt = null;
    project.archivedReason = null;
};

/**
 * Batch archive expired portfolios and portfolios of users with expired subscriptions.
 * @returns {Promise<Object>} Statistics of archived portfolios
 */
exports.archiveExpiredPortfolios = async () => {
    const now = new Date();
    let expiredArchivedCount = 0;
    let subscriptionArchivedCount = 0;

    // 1. Archive expired free portfolios
    const expiredProjects = await Project.find({
        status: 'Live',
        hostingExpiresAt: { $ne: null, $lt: now }
    });

    for (const project of expiredProjects) {
        project.status = 'Archived';
        project.archivedAt = now;
        project.archivedReason = 'expired';
        await project.save();
        expiredArchivedCount++;
    }

    // 2. Find users whose Pro subscription grace period has ended
    // We look for users on the 'pro' plan whose subscription is no longer active,
    // and whose grace period has expired (gracePeriodEnd < now)
    const unpaidProUsers = await User.find({
        plan: 'pro',
        'subscription.status': { $in: ['cancelled', 'completed', 'expired', 'halted', 'pending'] },
        'subscription.gracePeriodEnd': { $lt: now }
    });

    for (const user of unpaidProUsers) {
        // Find their Live portfolios and archive them
        const userProjects = await Project.find({
            user: user._id,
            status: 'Live'
        });

        for (const project of userProjects) {
            project.status = 'Archived';
            project.archivedAt = now;
            project.archivedReason = 'subscription_ended';
            await project.save();
            subscriptionArchivedCount++;
        }

        // Downgrade user's plan to free since subscription grace period ended
        user.plan = 'free';
        user.planUpdatedAt = now;
        user.subscription.status = 'expired';
        await user.save();
    }

    return {
        expiredArchived: expiredArchivedCount,
        subscriptionArchived: subscriptionArchivedCount,
        totalArchived: expiredArchivedCount + subscriptionArchivedCount
    };
};

/**
 * Lazy check and archive a single portfolio on access.
 * @param {Object} project - The project document
 * @returns {Promise<Boolean>} True if the portfolio is archived
 */
exports.checkAndArchiveSingle = async (project) => {
    // If it's already archived, return true
    if (project.status === 'Archived') {
        return true;
    }

    // If it's a draft, it's not live anyway
    if (project.status === 'Draft') {
        return false;
    }

    const now = new Date();

    // 1. Check direct hosting expiration (for free users)
    if (project.hostingExpiresAt && new Date(project.hostingExpiresAt) < now) {
        project.status = 'Archived';
        project.archivedAt = now;
        project.archivedReason = 'expired';
        await project.save();
        return true;
    }

    // 2. Check owner subscription status
    const owner = await User.findById(project.user);
    if (!owner) {
        return false;
    }

    if (owner.plan === 'pro') {
        const subStatus = owner.subscription ? owner.subscription.status : null;
        const graceEnd = owner.subscription && owner.subscription.gracePeriodEnd ? new Date(owner.subscription.gracePeriodEnd) : null;
        
        const isSubscriptionExpired = subStatus && 
            ['cancelled', 'completed', 'expired', 'halted', 'pending'].includes(subStatus) && 
            graceEnd && graceEnd < now;

        if (isSubscriptionExpired) {
            project.status = 'Archived';
            project.archivedAt = now;
            project.archivedReason = 'subscription_ended';
            await project.save();

            // Downgrade owner to free
            owner.plan = 'free';
            owner.planUpdatedAt = now;
            if (owner.subscription) {
                owner.subscription.status = 'expired';
            }
            await owner.save();
            return true;
        }
    }

    return false;
};

/**
 * Reactivate archived portfolios for a user after they upgrade or renew.
 * @param {String} userId - User ID
 * @param {String} newPlan - 'pro' or 'lifetime'
 */
exports.reactivatePortfolios = async (userId, newPlan) => {
    const user = await User.findById(userId);
    if (!user) return;

    // Find user's archived portfolios (due to expiration or subscription end)
    const archivedProjects = await Project.find({
        user: userId,
        status: 'Archived',
        archivedReason: { $in: ['expired', 'subscription_ended', 'plan_downgrade'] }
    }).sort({ updatedAt: -1 }); // Reactivate the most recently updated ones first

    // Determine limits
    const limits = {
        free: 1,
        pro: 5,
        lifetime: Infinity
    };
    const maxAllowed = limits[newPlan];

    // Count how many portfolios are currently Live
    const activeCount = await Project.countDocuments({
        user: userId,
        status: 'Live'
    });

    const slotsAvailable = maxAllowed - activeCount;
    if (slotsAvailable <= 0) return;

    // Reactivate up to the slot limit
    const toReactivate = archivedProjects.slice(0, slotsAvailable);
    const now = new Date();

    for (const project of toReactivate) {
        project.status = 'Live';
        project.archivedAt = null;
        project.archivedReason = null;
        
        // Setup expiration based on new plan
        if (newPlan === 'free') {
            project.hostingExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        } else {
            project.hostingExpiresAt = null;
        }

        await project.save();
    }
};
