const router = require('express').Router();
const db = require('../db/database');
const { authenticate, authorize, baseFilter } = require('../middleware/auth');

router.get('/', authenticate, baseFilter, (req, res) => {
  const params = req.baseFilter ? [req.baseFilter] : [];
  const where = req.baseFilter ? 'WHERE a.base = ?' : '';

  const assignments = db
    .prepare(`SELECT a.*, u.name as assigned_by_name FROM assignments a LEFT JOIN users u ON a.assigned_by = u.id ${where} ORDER BY a.date DESC`)
    .all(...params);

  res.json(assignments);
});

router.post('/', authenticate, authorize('admin', 'base_commander'), (req, res) => {
  const { asset_name, base, assigned_to, quantity, notes } = req.body;

  if (!asset_name || !base || !assigned_to || !quantity) {
    return res.status(400).json({ error: 'asset_name, base, assigned_to, and quantity are required' });
  }

  const asset = db.prepare('SELECT * FROM assets WHERE name = ? AND base = ?').get(asset_name, base);
  if (!asset || asset.quantity < quantity) {
    return res.status(400).json({ error: `Insufficient stock. Available: ${asset?.quantity ?? 0}` });
  }

  db.prepare('UPDATE assets SET quantity = quantity - ? WHERE id = ?').run(quantity, asset.id);

  const result = db
    .prepare('INSERT INTO assignments (asset_id, asset_name, base, assigned_to, quantity, assigned_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(asset.id, asset_name, base, assigned_to, quantity, req.user.id, notes || null);

  res.status(201).json({ id: result.lastInsertRowid });
});

// PATCH /api/assignments/:id/return — mark as returned
router.patch('/:id/return', authenticate, authorize('admin', 'base_commander'), (req, res) => {
  const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
  if (assignment.returned) return res.status(400).json({ error: 'Already returned' });

  db.transaction(() => {
    db.prepare('UPDATE assignments SET returned = 1 WHERE id = ?').run(assignment.id);
    db.prepare('UPDATE assets SET quantity = quantity + ? WHERE name = ? AND base = ?')
      .run(assignment.quantity, assignment.asset_name, assignment.base);
  })();

  res.json({ message: 'Returned successfully' });
});

module.exports = router;