// Lightweight Express app for integration tests.
// Routes are mounted directly (no IIFE, no server.listen, no rate-limiting).
process.env.JWT_SECRET  = process.env.JWT_SECRET  || 'test-jwt-secret';
process.env.JWT_EXPIRY  = process.env.JWT_EXPIRY  || '1h';
process.env.NODE_ENV    = 'test';
process.env.FRONTEND_URL = 'http://localhost:5173';

const express      = require('express');
const errorHandler = require('../middlewares/errorHandler');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',            require('../routes/authRoutes'));
app.use('/api/user',            require('../routes/userRoutes'));
app.use('/api/cost-estimation', require('../routes/costRoutes'));
app.use('/api/admin',           require('../routes/adminRoutes'));
app.use('/api/maps',            require('../routes/mapRoutes'));
app.use('/api/feedback',        require('../routes/feedbackRoutes'));
app.use('/api/materials',       require('../routes/materialRoutes'));
app.use('/api/json-maps',       require('../routes/jsonMapRoutes'));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

module.exports = app;
