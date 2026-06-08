require('dotenv').config();
const dns = require('dns');

// Fix: System DNS can't resolve MongoDB Atlas SRV records on this network
dns.setDefaultResultOrder('ipv4first');
try { dns.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4']); } catch (e) {}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const connectDB = require('./config/db');
const passport = require('passport');
require('./config/passport'); // Load passport strategies

const app = express();

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(passport.initialize());


// Security Headers
app.use(helmet());

// Compression
app.use(compression());

// Webhook route needs raw body for signature verification
app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
    if (req.body && Buffer.isBuffer(req.body)) {
        req.rawBody = req.body.toString('utf8');
        try {
            req.body = JSON.parse(req.rawBody);
        } catch (e) {
            req.body = {};
        }
    }
    next();
});

// Body parser
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Enable CORS
const allowedOrigins = [
    'https://profilio-portfolio-generator.vercel.app',
    'http://localhost:5173', // Vite default dev port
    'http://localhost:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(null, false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Route files
const auth = require('./routes/authRoutes');
const projects = require('./routes/projects');
const ai = require('./routes/aiRoutes');
const subscription = require('./routes/subscriptionRoutes');
const admin = require('./routes/adminRoutes');
const cron = require('./routes/cronRoutes');
const payments = require('./routes/paymentRoutes');

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
});

// Mount routers
app.use('/api/auth', auth);
app.use('/api/projects', projects);
app.use('/api/ai', ai);
app.use('/api/subscription', subscription);
app.use('/api/admin', admin);
app.use('/api/cron', cron);
app.use('/api', payments);

// Health Check Route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: "Backend is live !"
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Fallback CORS headers in error handler if origin is allowed
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    const errorMessage = process.env.NODE_ENV === 'production' ? 'Server Error' : err.message;
    res.status(500).json({
        success: false,
        message: errorMessage,
        error: errorMessage
    });
});


const PORT = process.env.PORT || 5000;

// Connect to database and then start server
connectDB().then(() => {
    if (process.env.NODE_ENV !== 'production') {
        app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
    }
}).catch((err) => {
    console.error('Failed to connect to DB, server not started', err);
    process.exit(1);
});

module.exports = app;
