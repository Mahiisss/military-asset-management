
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

/**
 * ✅ CORS Configuration
 * Open for all origins (best for Vercel + Render + demo)
 */
app.use(cors({
  origin: true,
  credentials: true
}));

// Middleware
app.use(bodyParser.json());

/**
 * ✅ Health Check Route
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * ✅ API Routes
 */
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/assets',       require('./routes/assets'));
app.use('/api/purchases',    require('./routes/purchases'));
app.use('/api/transfers',    require('./routes/transfers'));
app.use('/api/assignments',  require('./routes/assignments'));
app.use('/api/expenditures', require('./routes/expenditures'));

/**
 * ✅ Root Route
 */
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

/**
 * ✅ Global Error Handler
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

/**
 * ✅ Server Start
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

