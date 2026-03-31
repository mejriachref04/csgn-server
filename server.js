const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' } // needed for Cloudinary images
}));

// Compression
app.use(compression());

// Trust proxy (needed for Railway/Render behind nginx)
app.set('trust proxy', 1);

// CORS — allow frontend domain + localhost for dev
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting — login endpoint (prevent brute force)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                    // max 10 login attempts per 15 min per IP
    message: { message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// General API rate limit
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 200,
    message: { message: 'Trop de requêtes. Réessayez dans une minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/swimmers', require('./routes/swimmerRoutes'));
app.use('/api/subscriptions', require('./routes/subRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/planning', require('./routes/planningRoutes'));

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));
app.get('/', (req, res) => res.json({ message: 'CSGN API running 🏊', version: '1.0.0' }));

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(err.status || 500).json({
        message: process.env.NODE_ENV === 'production' ? 'Erreur serveur' : err.message
    });
});

// Cron jobs
require('./utils/cronJobs')();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 CSGN Server on port ${PORT} [${process.env.NODE_ENV || 'development'}]`));