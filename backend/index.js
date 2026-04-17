
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

// TEMPORARY SEED ROUTE - remove after seeding
app.get('/api/seed', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const db = require('./db/database');
    
    const users = [
      { name: 'System Admin',     email: 'admin@mil.gov',     password: bcrypt.hashSync('admin123', 10),       role: 'admin',             base: null },
      { name: 'Commander Alpha',  email: 'commander@mil.gov', password: bcrypt.hashSync('commander123', 10),   role: 'base_commander',    base: 'Alpha Base' },
      { name: 'Officer Bravo',    email: 'officer@mil.gov',   password: bcrypt.hashSync('officer123', 10),     role: 'logistics_officer', base: 'Bravo Base' },
    ];

    const insert = db.prepare(`INSERT OR IGNORE INTO users (name, email, password, role, base) VALUES (@name, @email, @password, @role, @base)`);
    for (const user of users) insert.run(user);

    const assets = [
      { name: 'M1 Abrams Tank',  type: 'vehicle',    base: 'Alpha Base', quantity: 12,    unit: 'units' },
      { name: 'AK-47 Rifle',     type: 'weapon',     base: 'Alpha Base', quantity: 200,   unit: 'units' },
      { name: '5.56mm Rounds',   type: 'ammunition', base: 'Alpha Base', quantity: 50000, unit: 'rounds' },
      { name: 'Humvee',          type: 'vehicle',    base: 'Bravo Base', quantity: 30,    unit: 'units' },
      { name: 'M16 Rifle',       type: 'weapon',     base: 'Bravo Base', quantity: 150,   unit: 'units' },
      { name: '9mm Pistol Ammo', type: 'ammunition', base: 'Bravo Base', quantity: 20000, unit: 'rounds' },
    ];

    const insertAsset = db.prepare(`INSERT OR IGNORE INTO assets (name, type, base, quantity, unit) VALUES (@name, @type, @base, @quantity, @unit)`);
    for (const asset of assets) insertAsset.run(asset);

    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});