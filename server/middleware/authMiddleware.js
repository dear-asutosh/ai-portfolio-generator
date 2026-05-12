const passport = require('passport');

// Protect routes
exports.protect = passport.authenticate('jwt', { session: false });
