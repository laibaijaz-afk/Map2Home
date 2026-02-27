require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
let authRoutes;
let userRoutes;
let costRoutes;
let adminRoutes;
let mapRoutes;
let feedbackRoutes;
let materialRoutes;
let jsonMapRoutes;
const errorHandler = require('./middlewares/errorHandler');
const initDb = require('./config/initDb');

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes for auth endpoints
  message: 'Too many login attempts, please try again later'
});

app.use(limiter);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Serve static files from drawings directory
app.use('/drawings', express.static(path.join(__dirname, '..', 'drawings')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start Server after initializing DB
const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await initDb();
  } catch (err) {
    console.error('[server] DB initialization failed:', err.message);
    // proceed anyway — if DB isn't critical to start, you might still want the server running
  }

  // Require routes after DB init to avoid connection-time ordering issues
  authRoutes = require('./routes/authRoutes');
  userRoutes = require('./routes/userRoutes');
  costRoutes = require('./routes/costRoutes');
  adminRoutes = require('./routes/adminRoutes');
  mapRoutes = require('./routes/mapRoutes');
  feedbackRoutes = require('./routes/feedbackRoutes');
  materialRoutes = require('./routes/materialRoutes');
  jsonMapRoutes = require('./routes/jsonMapRoutes');

  // Routes (now that they are required)
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/cost-estimation', costRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/maps', mapRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/materials', materialRoutes);
  app.use('/api/json-maps', jsonMapRoutes);

  // 404 Handler (after routes)
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  // Error Handler (after routes)
  app.use(errorHandler);

  // Initialize and start cron job for scraping
  const { startCronJob, runScrapingNow } = require('./services/scrapingCron');
  
  // Start cron job (runs every 5 minutes)
  startCronJob();
  
  // Run scraping immediately on server start
  runScrapingNow('startup')
    .then(result => {
      if (result.success) {
        console.log(`[Server] Initial scraping completed: ${result.result.totalUpdated || 0} materials updated`);
      } else {
        console.error(`[Server] Initial scraping failed: ${result.error}`);
      }
    })
    .catch(error => {
      console.error('[Server] Error in initial scraping:', error);
    });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`[Cron] Automatic price scraping enabled (every 5 minutes)`);
  });
})();

module.exports = app;
