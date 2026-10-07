import { useEffect, useState } from 'react';
import { api, clp } from '../api.js';

const empty = { name: '', barcode: '', cost: 0, price: 0, min_stock: 0, initial_stock: 0 };

export default function Products() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(null); // null = cerrado
  const [err, setErr] = useState('');
  const load = () => api('/products?q=' + encodeURIComponent(q)).then(setList);
  useEffect(() => { load(); }, [q]);

  const save = async (e) => {
    e.preventDefault(); setErr('');
    const body = { ...form, barcode: form.barcode || null, cost: +form.cost, price: +form.price, min_stock: +form.min_stock, initial_stock: +form.initial_stock };
    try {
      await api(form.id ? `/products/${form.id}` : '/products', { method: form.id ? 'PUT' : 'POST', body });
      setForm(null); load();
    } catch (x) { setErr(x.message); }
  };
  const remove = async (p) => { if (confirm(`¿Desactivar "${p.name}"?`)) { await api(`/products/${p.id}`, { method: 'DELETE' }); load(); } };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <section>
      <div className="bar">
        <input placeholder="Buscar por nombre o código" value={q} onChange={e => setQ(e.target.value)} />
        <button onClick={() => setForm(empty)}>Nuevo producto</button>
      </div>
      {form && (
        <form className="panel" onSubmit={save}>
          <label>Nombre<input required value={form.name} onChange={set('name')} /></label>
          <label>Código de barras<input value={form.barcode || ''} onChange={set('barcode')} /></label>
          <label>Costo<input type="number" min="0" value={form.cost} onChange={set('cost')} /></label>
          <label>Precio<input type="number" min="0" value={form.price} onChange={set('price')} /></label>
          {!form.id && <label>Stock inicial<input type="number" min="0" step="1" value={form.initial_stock ?? 0} onChange={set('initial_stock')} /></label>}
          <label>Stock mínimo<input type="number" min="0" value={form.min_stock} onChange={set('min_stock')} /></label>
          {err && <p className="error">{err}</p>}
          <div><button>Guardar</button> <button type="button" className="ghost" onClick={() => setForm(null)}>Cancelar</button></div>
        </form>
      )}
      <table>
        <thead><tr><th>Producto</th><th>Código</th><th>Costo</th><th>Precio</th><th>Stock</th><th></th></tr></thead>
        <tbody>
          {list.map(p => (
            <tr key={p.id} className={p.stock <= p.min_stock ? 'low' : ''}>
              <td>{p.name}</td><td>{p.barcode}</td><td>{clp(p.cost)}</td><td>{clp(p.price)}</td><td>{p.stock}</td>
              <td><button className="ghost" onClick={() => setForm(p)}>Editar</button> <button className="ghost" onClick={() => remove(p)}>Desactivar</button></td>
            </tr>
          ))}
          {!list.length && <tr><td colSpan="6" className="empty">Aún no hay productos. Crea el primero con "Nuevo producto".</td></tr>}
        </tbody>
      </table>
    </section>
  );
}
