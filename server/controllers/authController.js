const User = require('../models/User');
const passport = require('passport');
const cloudinary = require('../config/cloudinary');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ success: false, error: info.message || 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    })(req, res, next);
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            bio: req.body.bio,
            avatar: req.body.avatar,
            username: req.body.username
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Upload avatar to Cloudinary
// @route   POST /api/auth/uploadavatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a file' });
        }

        // Upload to cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'Profile-picture-Profilio',
                transformation: [
                    { width: 500, height: 500, crop: 'fill', gravity: 'face' }
                ]
            },
            (error, result) => {
                if (error) {
                    return res.status(500).json({ success: false, error: 'Cloudinary upload failed' });
                }
                res.status(200).json({
                    success: true,
                    url: result.secure_url
                });
            }
        );

        uploadStream.end(req.file.buffer);
    } catch (err) {
        next(err);
    }
};

// @desc    Check if username is available
// @route   GET /api/auth/checkusername/:username
// @access  Private
exports.checkUsername = async (req, res, next) => {
    try {
        const username = req.params.username.toLowerCase();
        
        // Basic validation for username format
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            return res.status(200).json({
                success: true,
                available: false,
                message: 'Username must be 3-20 characters and contain only letters, numbers, or underscores'
            });
        }

        const user = await User.findOne({ username });

        if (user) {
            return res.status(200).json({
                success: true,
                available: false,
                message: 'Username is already taken'
            });
        }

        res.status(200).json({
            success: true,
            available: true,
            message: 'Username is available'
        });
    } catch (err) {
        next(err);
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .json({
            success: true,
            token
        });
};
