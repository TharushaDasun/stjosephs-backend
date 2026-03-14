require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// ============================
// Middleware
// ============================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================
// API Routes
// ============================
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/gallery',     require('./routes/gallery'));
app.use('/api/events',      require('./routes/events'));
app.use('/api/livestream',  require('./routes/livestream'));
app.use('/api/visitors',    require('./routes/visitors'));
app.use('/api/videos',      require('./routes/videos'));
app.use('/api/subadmins',   require('./routes/subadmins'));
app.use('/api/activitylog', require('./routes/activitylog'));
app.use('/api/countdown',   require('./routes/countdown'));

// ============================
// Health check
// ============================
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: "St. Joseph's Media Unit API is running",
        time: new Date().toISOString(),
    });
});

// ============================
// 404 handler
// ============================
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found.' });
});

// ============================
// Global error handler
// ============================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message || 'Server error.' });
});

// ============================
// Start server
// ============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🏥 Health: http://localhost:${PORT}/api/health\n`);
});
