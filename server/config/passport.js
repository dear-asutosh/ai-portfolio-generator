const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// Local Strategy for email/password login
passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try {
                // Find user and include password for matching
                const user = await User.findOne({ email }).select('+password');

                if (!user) {
                    return done(null, false, { message: 'Invalid credentials' });
                }

                // Match password
                const isMatch = await user.matchPassword(password);

                if (!isMatch) {
                    return done(null, false, { message: 'Invalid credentials' });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

// JWT Strategy for protecting routes
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(
    new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
        try {
            const user = await User.findById(jwtPayload.id);

            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (err) {
            return done(err, false);
        }
    })
);

// Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
            proxy: true
        },
        async (accessToken, refreshToken, profile, done) => {
            const newUser = {
                socialId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0]?.value,
                provider: 'google'
            };

            try {
                let user = await User.findOne({ 
                    $or: [
                        { socialId: profile.id },
                        { email: profile.emails[0].value }
                    ]
                });

                if (user) {
                    // Update socialId and avatar if user existed
                    user.socialId = profile.id;
                    user.provider = 'google';
                    if (!user.avatar || user.avatar.includes('flaticon.com')) {
                        user.avatar = profile.photos[0]?.value;
                    }
                    await user.save();
                    done(null, user);
                } else {
                    user = await User.create(newUser);
                    done(null, user);
                }
            } catch (err) {
                done(err);
            }
        }
    )
);

// GitHub Strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: '/api/auth/github/callback',
            proxy: true
        },
        async (accessToken, refreshToken, profile, done) => {
            const newUser = {
                socialId: profile.id,
                name: profile.displayName || profile.username,
                email: profile.emails ? profile.emails[0].value : `${profile.username}@github.com`,
                avatar: profile.photos[0]?.value,
                provider: 'github'
            };

            try {
                let user = await User.findOne({ 
                    $or: [
                        { socialId: profile.id },
                        { email: newUser.email }
                    ]
                });

                if (user) {
                    user.socialId = profile.id;
                    user.provider = 'github';
                    if (!user.avatar || user.avatar.includes('flaticon.com')) {
                        user.avatar = profile.photos[0]?.value;
                    }
                    await user.save();
                    done(null, user);
                } else {
                    user = await User.create(newUser);
                    done(null, user);
                }
            } catch (err) {
                done(err);
            }
        }
    )
);

module.exports = passport;
