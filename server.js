const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const { fetchAndStoreData } = require('./services/mgnregaService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Mgnrega Tracker Api is working properly!' });
});

// Fetch data on server start
fetchAndStoreData().catch(err => console.error('Initial data fetch failed:', err));

// Schedule daily data refresh at 2 AM
cron.schedule('0 2 * * *', () => {
  console.log('Running scheduled data refresh...');
  fetchAndStoreData().catch(err => console.error('Scheduled fetch failed:', err));
});

// Manual refresh endpoint
app.post('/api/refresh-data', async (req, res) => {
  try {
    await fetchAndStoreData();
    res.json({ message: 'Data refresh completed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Data refresh failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});