const express = require('express');
const passport = require('passport');
const { register, login, getMe, updateDetails, checkUsername, uploadAvatar } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.post('/uploadavatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/checkusername/:username', protect, checkUsername);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const token = req.user.getSignedJwtToken();
        res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
    }
);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', 
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const token = req.user.getSignedJwtToken();
        res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
    }
);

module.exports = router;
