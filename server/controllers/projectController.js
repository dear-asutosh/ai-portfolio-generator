const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects for logged in user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({ user: req.user.id }).sort({ updatedAt: -1 });
        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Make sure user owns the project
        if (project.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to access this project' });
        }

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.user = req.user.id;
        
        console.log('Creating project with data:', req.body);

        const project = await Project.create(req.body);

        res.status(201).json({
            success: true,
            data: project
        });
    } catch (err) {
        console.error('Project Creation Error:', err.message);
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Make sure user owns the project
        if (project.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this project' });
        }

        project = await Project.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: 'after',
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Make sure user owns the project
        if (project.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to delete this project' });
        }

        await project.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single public project
// @route   GET /api/projects/public/:id
// @access  Public
exports.getPublicProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // We only allow viewing if the project is Live
        if (project.status !== 'Live') {
            return res.status(403).json({ success: false, message: 'This project is a draft and is not published yet' });
        }

        // Increment the view counter dynamically for public views
        const updatedProject = await Project.findByIdAndUpdate(
            project._id,
            { $inc: { views: 1 } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: updatedProject
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get public project by username and slug
// @route   GET /api/projects/public/user/:username/:slug?
// @access  Public
exports.getPublicProjectByUserAndSlug = async (req, res, next) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });

        console.log("DEBUG getPublicProjectByUserAndSlug username:", username);
        console.log("DEBUG found user:", user ? user._id : 'null');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let query = { user: user._id };
        if (req.params.slug) {
            query.slug = req.params.slug.toLowerCase();
        }

        // Sort by latest updated if multiple match (e.g. no slug specified)
        const project = await Project.findOne(query).sort({ updatedAt: -1 });

        if (!project) {
            return res.status(404).json({ success: false, message: 'No portfolio found' });
        }

        // We only allow viewing if the project is Live
        if (project.status !== 'Live') {
            return res.status(403).json({ success: false, message: 'This project is a draft and is not published yet' });
        }

        // Increment the view counter dynamically for public views
        const updatedProject = await Project.findByIdAndUpdate(
            project._id,
            { $inc: { views: 1 } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: updatedProject
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
