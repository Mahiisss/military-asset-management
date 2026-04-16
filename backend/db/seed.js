const db = require('./database');
const bcrypt = require('bcryptjs');

const users = [
  {
    name: 'System Admin',
    email: 'admin@mil.gov',
    password: 'admin123',
    role: 'admin',
    base: null,
  },
  {
    name: 'Commander Alpha',
    email: 'commander@mil.gov',
    password: 'commander123',
    role: 'base_commander',
    base: 'Alpha Base',
  },
  {
    name: 'Officer Bravo',
    email: 'officer@mil.gov',
    password: 'officer123',
    role: 'logistics_officer',
    base: 'Bravo Base',
  },
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO users (name, email, password, role, base)
  VALUES (@name, @email, @password, @role, @base)
`);

for (const user of users) {
  user.password = bcrypt.hashSync(user.password, 10);
  insert.run(user);
}

// Seed some sample assets
const assets = [
  { name: 'M1 Abrams Tank',   type: 'vehicle',    base: 'Alpha Base', quantity: 12, unit: 'units' },
  { name: 'AK-47 Rifle',      type: 'weapon',     base: 'Alpha Base', quantity: 200, unit: 'units' },
  { name: '5.56mm Rounds',    type: 'ammunition', base: 'Alpha Base', quantity: 50000, unit: 'rounds' },
  { name: 'Humvee',           type: 'vehicle',    base: 'Bravo Base', quantity: 30, unit: 'units' },
  { name: 'M16 Rifle',        type: 'weapon',     base: 'Bravo Base', quantity: 150, unit: 'units' },
  { name: '9mm Pistol Ammo',  type: 'ammunition', base: 'Bravo Base', quantity: 20000, unit: 'rounds' },
];

const insertAsset = db.prepare(`
  INSERT OR IGNORE INTO assets (name, type, base, quantity, unit)
  VALUES (@name, @type, @base, @quantity, @unit)
`);

for (const asset of assets) {
  insertAsset.run(asset);
}

console.log('Database seeded successfully.');