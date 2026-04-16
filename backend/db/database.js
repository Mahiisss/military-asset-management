const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'military.db'));

// Enable WAL for better performance
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    email     TEXT    NOT NULL UNIQUE,
    password  TEXT    NOT NULL,
    role      TEXT    NOT NULL CHECK(role IN ('admin','base_commander','logistics_officer')),
    base      TEXT,
    created_at TEXT   DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS assets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    type        TEXT    NOT NULL CHECK(type IN ('vehicle','weapon','ammunition','equipment')),
    base        TEXT    NOT NULL,
    quantity    INTEGER NOT NULL DEFAULT 0,
    unit        TEXT    NOT NULL DEFAULT 'units',
    created_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id    INTEGER REFERENCES assets(id),
    asset_name  TEXT    NOT NULL,
    asset_type  TEXT    NOT NULL,
    base        TEXT    NOT NULL,
    quantity    INTEGER NOT NULL,
    unit        TEXT    NOT NULL DEFAULT 'units',
    purchased_by INTEGER REFERENCES users(id),
    notes       TEXT,
    date        TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transfers (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id      INTEGER REFERENCES assets(id),
    asset_name    TEXT    NOT NULL,
    asset_type    TEXT    NOT NULL,
    from_base     TEXT    NOT NULL,
    to_base       TEXT    NOT NULL,
    quantity      INTEGER NOT NULL,
    transferred_by INTEGER REFERENCES users(id),
    status        TEXT    DEFAULT 'completed',
    notes         TEXT,
    date          TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id      INTEGER REFERENCES assets(id),
    asset_name    TEXT    NOT NULL,
    base          TEXT    NOT NULL,
    assigned_to   TEXT    NOT NULL,
    quantity      INTEGER NOT NULL,
    assigned_by   INTEGER REFERENCES users(id),
    returned      INTEGER DEFAULT 0,
    notes         TEXT,
    date          TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS expenditures (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id     INTEGER REFERENCES assets(id),
    asset_name   TEXT    NOT NULL,
    base         TEXT    NOT NULL,
    quantity     INTEGER NOT NULL,
    reason       TEXT    NOT NULL,
    expended_by  INTEGER REFERENCES users(id),
    notes        TEXT,
    date         TEXT    DEFAULT (datetime('now'))
  );
`);

module.exports = db;