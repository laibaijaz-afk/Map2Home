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
const isProduction = process.env.NODE_ENV === 'production';

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatError(err) {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;

  const parts = [];
  if (err.message) parts.push(err.message);
  if (err.code) parts.push(`code=${err.code}`);
  if (err.errno !== undefined && err.errno !== null) parts.push(`errno=${err.errno}`);
  if (err.syscall) parts.push(`syscall=${err.syscall}`);
  if (err.address) parts.push(`address=${err.address}`);
  if (err.port !== undefined && err.port !== null) parts.push(`port=${err.port}`);

  return parts.length ? parts.join(' | ') : String(err);
}

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
  windowMs: parsePositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, isProduction ? 5 : 100),
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

app.use(limiter);

// Body Parser
const bodyLimit = process.env.BODY_LIMIT || '25mb';
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Serve static files from drawings directory
app.use('/drawings', express.static(path.join(__dirname, '..', 'drawings')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start Server after initializing DB
const PORT = Number.parseInt(process.env.PORT, 10) || 5000;
(async () => {
  let isDbReady = true;
  try {
    await initDb();
  } catch (err) {
    console.error('[server] DB initialization failed:', formatError(err));
    isDbReady = false;
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

  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);

    if (isDbReady) {
      // Initialize and start cron job only after server is listening and DB is reachable.
      const { startCronJob, runScrapingNow } = require('./services/scrapingCron');
      startCronJob();

      runScrapingNow('startup')
        .then(result => {
          if (result.success) {
            console.log(`[Server] Initial scraping completed: ${result.result.totalUpdated || 0} materials updated`);
          } else {
            console.error(`[Server] Initial scraping failed: ${result.error}`);
          }
        })
        .catch(error => {
          console.error('[Server] Error in initial scraping:', formatError(error));
        });

      console.log('[Cron] Automatic price scraping enabled (every 5 minutes)');
    } else {
      console.warn('[Cron] Skipped cron startup because database is not reachable.');
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[server] Port ${PORT} is already in use.`);
      console.error(`[server] Update PORT in backend/.env (example: PORT=${PORT + 1}) or stop the process using that port.`);
      console.error('[server] macOS check: lsof -nP -iTCP:' + PORT + ' -sTCP:LISTEN');
    } else {
      console.error('[server] Failed to start HTTP server:', formatError(err));
    }
    process.exit(1);
  });
})();

module.exports = app;
