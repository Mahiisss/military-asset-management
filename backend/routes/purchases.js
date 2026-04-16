const router = require('express').Router();
const db = require('../db/database');
const { authenticate, authorize, baseFilter } = require('../middleware/auth');

// GET /api/purchases
router.get('/', authenticate, baseFilter, (req, res) => {
  const { base, from, to } = req.query;

  let query = 'SELECT p.*, u.name as buyer_name FROM purchases p LEFT JOIN users u ON p.purchased_by = u.id WHERE 1=1';
  const params = [];

  if (req.baseFilter) {
    query += ' AND p.base = ?';
    params.push(req.baseFilter);
  } else if (base) {
    query += ' AND p.base = ?';
    params.push(base);
  }

  if (from) { query += ' AND p.date >= ?'; params.push(from); }
  if (to)   { query += ' AND p.date <= ?'; params.push(to); }

  query += ' ORDER BY p.date DESC';

  res.json(db.prepare(query).all(...params));
});

// POST /api/purchases — record a new purchase
router.post('/', authenticate, authorize('admin', 'base_commander'), (req, res) => {
  const { asset_name, asset_type, base, quantity, unit, notes } = req.body;

  if (!asset_name || !asset_type || !base || !quantity) {
    return res.status(400).json({ error: 'asset_name, asset_type, base, and quantity are required' });
  }

  if (req.user.role === 'base_commander' && req.user.base !== base) {
    return res.status(403).json({ error: 'You can only purchase for your own base' });
  }

  // Upsert the asset stock
  const existing = db.prepare('SELECT id FROM assets WHERE name = ? AND base = ?').get(asset_name, base);

  let assetId;
  if (existing) {
    db.prepare('UPDATE assets SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
    assetId = existing.id;
  } else {
    const res2 = db
      .prepare('INSERT INTO assets (name, type, base, quantity, unit) VALUES (?, ?, ?, ?, ?)')
      .run(asset_name, asset_type, base, quantity, unit || 'units');
    assetId = res2.lastInsertRowid;
  }

  const result = db
    .prepare('INSERT INTO purchases (asset_id, asset_name, asset_type, base, quantity, unit, purchased_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(assetId, asset_name, asset_type, base, quantity, unit || 'units', req.user.id, notes || null);

  res.status(201).json({ id: result.lastInsertRowid, asset_name, base, quantity });
});

module.exports = router;