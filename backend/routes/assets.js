const router = require('express').Router();
const db = require('../db/database');
const { authenticate, authorize, baseFilter } = require('../middleware/auth');

// GET /api/assets — list assets, filtered by base for non-admins
router.get('/', authenticate, baseFilter, (req, res) => {
  const { type, base } = req.query;

  let query = 'SELECT * FROM assets WHERE 1=1';
  const params = [];

  if (req.baseFilter) {
    query += ' AND base = ?';
    params.push(req.baseFilter);
  } else if (base) {
    query += ' AND base = ?';
    params.push(base);
  }

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  query += ' ORDER BY base, type, name';

  const assets = db.prepare(query).all(...params);
  res.json(assets);
});

// GET /api/assets/summary — dashboard stats
router.get('/summary', authenticate, baseFilter, (req, res) => {
  const baseWhere = req.baseFilter ? 'WHERE base = ?' : '';
  const params = req.baseFilter ? [req.baseFilter] : [];

  const totalByType = db
    .prepare(`SELECT type, SUM(quantity) as total FROM assets ${baseWhere} GROUP BY type`)
    .all(...params);

  const totalByBase = db
    .prepare(`SELECT base, SUM(quantity) as total FROM assets ${baseWhere} GROUP BY base`)
    .all(...params);

  const recentPurchases = db
    .prepare(`SELECT * FROM purchases ${baseWhere} ORDER BY date DESC LIMIT 5`)
    .all(...params);

  const recentTransfers = db
    .prepare(`SELECT * FROM transfers ${req.baseFilter ? 'WHERE from_base = ? OR to_base = ?' : ''} ORDER BY date DESC LIMIT 5`)
    .all(...(req.baseFilter ? [req.baseFilter, req.baseFilter] : []));

  res.json({ totalByType, totalByBase, recentPurchases, recentTransfers });
});

// POST /api/assets — create a new asset (admin + commander)
router.post('/', authenticate, authorize('admin', 'base_commander'), (req, res) => {
  const { name, type, base, quantity, unit } = req.body;

  if (!name || !type || !base || quantity == null) {
    return res.status(400).json({ error: 'name, type, base, and quantity are required' });
  }

  // Commanders can only add assets to their own base
  if (req.user.role === 'base_commander' && req.user.base !== base) {
    return res.status(403).json({ error: 'You can only add assets to your own base' });
  }

  const result = db
    .prepare('INSERT INTO assets (name, type, base, quantity, unit) VALUES (?, ?, ?, ?, ?)')
    .run(name, type, base, quantity, unit || 'units');

  res.status(201).json({ id: result.lastInsertRowid, name, type, base, quantity, unit });
});

module.exports = router;