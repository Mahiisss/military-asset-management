const router = require('express').Router();
const db = require('../db/database');
const { authenticate, authorize, baseFilter } = require('../middleware/auth');

router.get('/', authenticate, baseFilter, (req, res) => {
  const params = req.baseFilter ? [req.baseFilter, req.baseFilter] : [];
  const where = req.baseFilter ? 'WHERE t.from_base = ? OR t.to_base = ?' : '';

  const transfers = db
    .prepare(`SELECT t.*, u.name as transferred_by_name FROM transfers t LEFT JOIN users u ON t.transferred_by = u.id ${where} ORDER BY t.date DESC`)
    .all(...params);

  res.json(transfers);
});

router.post('/', authenticate, authorize('admin', 'base_commander'), (req, res) => {
  const { asset_name, asset_type, from_base, to_base, quantity, notes } = req.body;

  if (!asset_name || !from_base || !to_base || !quantity) {
    return res.status(400).json({ error: 'asset_name, from_base, to_base, and quantity are required' });
  }

  if (from_base === to_base) {
    return res.status(400).json({ error: 'Source and destination base cannot be the same' });
  }

  if (req.user.role === 'base_commander' && req.user.base !== from_base) {
    return res.status(403).json({ error: 'You can only transfer assets from your own base' });
  }

  // Check source has enough stock
  const source = db.prepare('SELECT * FROM assets WHERE name = ? AND base = ?').get(asset_name, from_base);
  if (!source || source.quantity < quantity) {
    return res.status(400).json({ error: `Insufficient stock at ${from_base}. Available: ${source?.quantity ?? 0}` });
  }

  // Atomic transfer using a transaction
  const doTransfer = db.transaction(() => {
    db.prepare('UPDATE assets SET quantity = quantity - ? WHERE name = ? AND base = ?').run(quantity, asset_name, from_base);

    const dest = db.prepare('SELECT id FROM assets WHERE name = ? AND base = ?').get(asset_name, to_base);
    if (dest) {
      db.prepare('UPDATE assets SET quantity = quantity + ? WHERE id = ?').run(quantity, dest.id);
    } else {
      db.prepare('INSERT INTO assets (name, type, base, quantity, unit) VALUES (?, ?, ?, ?, ?)').run(
        asset_name, asset_type || source.type, to_base, quantity, source.unit
      );
    }

    return db
      .prepare('INSERT INTO transfers (asset_id, asset_name, asset_type, from_base, to_base, quantity, transferred_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(source.id, asset_name, source.type, from_base, to_base, quantity, req.user.id, notes || null);
  });

  const result = doTransfer();
  res.status(201).json({ id: result.lastInsertRowid, asset_name, from_base, to_base, quantity });
});

module.exports = router;