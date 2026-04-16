const router = require('express').Router();
const db = require('../db/database');
const { authenticate, authorize, baseFilter } = require('../middleware/auth');

router.get('/', authenticate, baseFilter, (req, res) => {
  const params = req.baseFilter ? [req.baseFilter] : [];
  const where = req.baseFilter ? 'WHERE e.base = ?' : '';

  const data = db
    .prepare(`SELECT e.*, u.name as expended_by_name FROM expenditures e LEFT JOIN users u ON e.expended_by = u.id ${where} ORDER BY e.date DESC`)
    .all(...params);

  res.json(data);
});

router.post('/', authenticate, authorize('admin', 'base_commander', 'logistics_officer'), (req, res) => {
  const { asset_name, base, quantity, reason, notes } = req.body;

  if (!asset_name || !base || !quantity || !reason) {
    return res.status(400).json({ error: 'asset_name, base, quantity, and reason are required' });
  }

  const asset = db.prepare('SELECT * FROM assets WHERE name = ? AND base = ?').get(asset_name, base);
  if (!asset || asset.quantity < quantity) {
    return res.status(400).json({ error: `Insufficient stock. Available: ${asset?.quantity ?? 0}` });
  }

  db.prepare('UPDATE assets SET quantity = quantity - ? WHERE id = ?').run(quantity, asset.id);

  const result = db
    .prepare('INSERT INTO expenditures (asset_id, asset_name, base, quantity, reason, expended_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(asset.id, asset_name, base, quantity, reason, req.user.id, notes || null);

  res.status(201).json({ id: result.lastInsertRowid });
});

module.exports = router;