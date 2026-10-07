import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { db, applyMovement } from './db.js';

const SECRET = process.env.JWT_SECRET || 'cambiar-en-produccion';
const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors());
app.use(express.json());

const wrap = (fn) => (req, res) => {
  try { res.json(fn(req, res)); }
  catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.issues.map(i => `${i.path}: ${i.message}`).join(', ') });
    if (String(e.message).includes('UNIQUE')) return res.status(400).json({ error: 'Código de barras duplicado' });
    res.status(e.status || 500).json({ error: e.message });
  }
};

const auth = (roles) => (req, res, next) => {
  try {
    req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), SECRET);
    if (roles && !roles.includes(req.user.role)) return res.status(403).json({ error: 'Sin permiso' });
    next();
  } catch { res.status(401).json({ error: 'Sesión inválida' }); }
};

app.post('/api/login', wrap((req) => {
  const { username, password } = z.object({ username: z.string(), password: z.string() }).parse(req.body);
  const u = db.prepare('SELECT * FROM users WHERE username=? AND active=1').get(username);
  if (!u || !bcrypt.compareSync(password, u.password_hash)) throw Object.assign(new Error('Usuario o clave incorrectos'), { status: 401 });
  const user = { id: u.id, username: u.username, role: u.role };
  return { token: jwt.sign(user, SECRET, { expiresIn: '12h' }), user };
}));

// ---- Productos
const productSchema = z.object({
  name: z.string().min(1), barcode: z.string().trim().min(1).nullable().optional(),
  category_id: z.number().int().nullable().optional(),
  cost: z.number().int().min(0), price: z.number().int().min(0), min_stock: z.number().int().min(0),
});

app.get('/api/products', auth(), wrap((req) => {
  const q = `%${req.query.q || ''}%`;
  return db.prepare(`SELECT p.*, c.name AS category FROM products p LEFT JOIN categories c ON c.id=p.category_id
    WHERE p.active=1 AND (p.name LIKE ? OR p.barcode LIKE ?) ORDER BY p.name LIMIT 500`).all(q, q);
}));

app.get('/api/products/barcode/:code', auth(), wrap((req) => {
  const p = db.prepare('SELECT * FROM products WHERE barcode=? AND active=1').get(req.params.code);
  if (!p) throw Object.assign(new Error('Código no registrado'), { status: 404 });
  return p;
}));

app.post('/api/products', auth(['dueno']), wrap((req) => {
  const d = productSchema.extend({ initial_stock: z.number().int().min(0).default(0) }).parse(req.body);
  return db.transaction(() => {
    const r = db.prepare('INSERT INTO products (name,barcode,category_id,cost,price,min_stock) VALUES (?,?,?,?,?,?)')
      .run(d.name, d.barcode ?? null, d.category_id ?? null, d.cost, d.price, d.min_stock);
    if (d.initial_stock > 0) {
      applyMovement({ productId: Number(r.lastInsertRowid), type: 'compra', qty: d.initial_stock, userId: req.user.id, note: 'Stock inicial' });
    }
    return { id: r.lastInsertRowid };
  })();
}));

app.put('/api/products/:id', auth(['dueno']), wrap((req) => {
  const d = productSchema.parse(req.body);
  db.prepare('UPDATE products SET name=?,barcode=?,category_id=?,cost=?,price=?,min_stock=? WHERE id=?')
    .run(d.name, d.barcode ?? null, d.category_id ?? null, d.cost, d.price, d.min_stock, req.params.id);
  return { ok: true };
}));

app.delete('/api/products/:id', auth(['dueno']), wrap((req) => { // desactivar, no borrar
  db.prepare('UPDATE products SET active=0 WHERE id=?').run(req.params.id);
  return { ok: true };
}));

app.get('/api/categories', auth(), wrap(() => db.prepare('SELECT * FROM categories ORDER BY name').all()));
app.post('/api/categories', auth(['dueno']), wrap((req) => {
  const { name } = z.object({ name: z.string().min(1) }).parse(req.body);
  return { id: db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)').run(name).lastInsertRowid };
}));

// ---- Movimientos de stock
app.post('/api/movements', auth(), wrap((req) => {
  const d = z.object({
    productId: z.number().int(), type: z.enum(['compra', 'venta', 'merma', 'ajuste', 'conteo']),
    qty: z.number().int(), note: z.string().optional(),
  }).parse(req.body);
  if (['compra', 'ajuste', 'conteo'].includes(d.type) && req.user.role !== 'dueno')
    throw Object.assign(new Error('Solo el dueño puede hacer este movimiento'), { status: 403 });
  return applyMovement({ ...d, userId: req.user.id });
}));

app.get('/api/movements', auth(), wrap((req) => db.prepare(`
  SELECT m.*, p.name AS product, u.username FROM stock_movements m
  JOIN products p ON p.id=m.product_id LEFT JOIN users u ON u.id=m.user_id
  WHERE (? IS NULL OR m.product_id=?) ORDER BY m.id DESC LIMIT 200`)
  .all(req.query.productId ?? null, req.query.productId ?? null)));

// ---- Reportes
app.get('/api/reports/summary', auth(['dueno']), wrap(() => ({
  products: db.prepare('SELECT COUNT(*) n FROM products WHERE active=1').get().n,
  inventoryCost: db.prepare('SELECT COALESCE(SUM(stock*cost),0) v FROM products WHERE active=1').get().v,
  inventoryRetail: db.prepare('SELECT COALESCE(SUM(stock*price),0) v FROM products WHERE active=1').get().v,
  lowStock: db.prepare('SELECT id,name,stock,min_stock FROM products WHERE active=1 AND stock<=min_stock ORDER BY stock').all(),
})));

// ---- Servir el frontend compilado (producción)
const dist = path.resolve('../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, '127.0.0.1', () => console.log(`API en http://localhost:${PORT}`));
