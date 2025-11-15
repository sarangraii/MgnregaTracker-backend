const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const { fetchAndStoreData } = require('./services/mgnregaService');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
app.use(cors({
  origin: [
    'https://mgnrega-tracker-frontend.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', apiRoutes);

// Health check with keep-alive logging
let healthCheckCount = 0;
app.get('/health', (req, res) => {
  healthCheckCount++;
  const now = new Date();
  
  // Log every 10th health check to avoid spam
  if (healthCheckCount % 10 === 0) {
    console.log(`💚 Keep-alive ping #${healthCheckCount} at ${now.toLocaleTimeString()}`);
  }
  
  res.json({ 
    status: 'OK', 
    timestamp: now,
    uptime: process.uptime(),
    checks: healthCheckCount
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'MGNREGA Tracker API is working!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      districts: '/api/districts',
      stats: '/api/stats/summary'
    }
  });
});

// START SERVER FIRST, then fetch data
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for Vercel frontend`);
  
  // Fetch data in background after server starts
  setTimeout(() => {
    console.log('📊 Starting initial data fetch...');
    fetchAndStoreData()
      .then(() => console.log('✅ Initial data loaded successfully'))
      .catch(err => console.error('❌ Data fetch failed:', err.message));
  }, 2000);
});

// Schedule daily refresh at 2 AM
cron.schedule('0 2 * * *', () => {
  console.log('🔄 Running scheduled data refresh at 2 AM...');
  fetchAndStoreData()
    .then(() => console.log('✅ Scheduled refresh completed'))
    .catch(err => console.error('❌ Scheduled fetch failed:', err.message));
});

// Manual refresh endpoint
app.post('/api/refresh-data', async (req, res) => {
  try {
    console.log('🔄 Manual data refresh triggered');
    await fetchAndStoreData();
    res.json({ 
      success: true, 
      message: 'Data refresh completed successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Manual refresh failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Data refresh failed',
      message: error.message 
    });
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Promise Rejection:', err.message);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});