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

// Connect to database
connectDB();

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

// Body parser
app.use(express.json());

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

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
});

// Mount routers
app.use('/api/auth', auth);
app.use('/api/projects', projects);
app.use('/api/ai', ai);

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

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
}

module.exports = app;
