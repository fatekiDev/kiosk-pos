import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const dir = process.env.DATA_DIR || path.resolve('data');
fs.mkdirSync(dir, { recursive: true });
export const db = new Database(path.join(dir, 'kiosko.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Dinero en enteros (CLP). Stock solo cambia vía stock_movements.
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('dueno','cajero')), active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, barcode TEXT UNIQUE,
  category_id INTEGER REFERENCES categories(id),
  cost INTEGER NOT NULL DEFAULT 0, price INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0, min_stock INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS stock_movements (
  id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL REFERENCES products(id),
  type TEXT NOT NULL CHECK (type IN ('compra','venta','merma','ajuste','conteo')),
  qty INTEGER NOT NULL, stock_after INTEGER NOT NULL,
  user_id INTEGER REFERENCES users(id), note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS idx_mov_product ON stock_movements(product_id);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
`);

if (!db.prepare('SELECT 1 FROM users').get()) {
  db.prepare('INSERT INTO users (username,password_hash,role) VALUES (?,?,?)')
    .run('admin', bcrypt.hashSync('admin123', 10), 'dueno');
  console.warn('Usuario inicial: admin / admin123 (cámbialo)');
}

// Registra un movimiento y actualiza el stock en una sola transacción.
// compra: +qty | venta, merma: -qty | ajuste: qty con signo | conteo: fija el stock a qty
export const applyMovement = db.transaction(({ productId, type, qty, userId, note }) => {
  const p = db.prepare('SELECT stock FROM products WHERE id=? AND active=1').get(productId);
  if (!p) throw Object.assign(new Error('Producto no existe'), { status: 404 });
  let delta;
  if (type === 'compra') delta = Math.abs(qty);
  else if (type === 'venta' || type === 'merma') delta = -Math.abs(qty);
  else if (type === 'ajuste') delta = qty;
  else delta = qty - p.stock; // conteo
  const after = p.stock + delta;
  if (after < 0) throw Object.assign(new Error(`Stock quedaría negativo (${after})`), { status: 400 });
  db.prepare('UPDATE products SET stock=? WHERE id=?').run(after, productId);
  db.prepare('INSERT INTO stock_movements (product_id,type,qty,stock_after,user_id,note) VALUES (?,?,?,?,?,?)')
    .run(productId, type, delta, after, userId, note || null);
  return { stock: after, delta };
});
