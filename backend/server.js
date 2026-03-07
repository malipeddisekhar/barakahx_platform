const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');

const app = express();

// Trust Render's reverse proxy so req.protocol is 'https' in production
app.set('trust proxy', 1);

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    process.env.FRONTEND_URL, // e.g. https://barakahx.vercel.app
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow: no origin (Postman/mobile), any localhost port, and whitelisted origins
        if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ message: 'BarakahX API is running', status: 'ok' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/barakahx';

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });
