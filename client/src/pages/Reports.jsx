import { useEffect, useState } from 'react';
import { api, clp } from '../api.js';

export default function Reports() {
  const [s, setS] = useState(null);
  useEffect(() => { api('/reports/summary').then(setS); }, []);
  if (!s) return <p>Cargando…</p>;
  return (
    <section>
      <div className="stats">
        <div><span>{s.products}</span>productos activos</div>
        <div><span>{clp(s.inventoryCost)}</span>inventario a costo</div>
        <div><span>{clp(s.inventoryRetail)}</span>inventario a precio de venta</div>
        <div><span>{clp(s.inventoryRetail - s.inventoryCost)}</span>margen potencial</div>
      </div>
      <h2>Productos con stock bajo</h2>
      <table>
        <thead><tr><th>Producto</th><th>Stock</th><th>Mínimo</th></tr></thead>
        <tbody>
          {s.lowStock.map(p => <tr key={p.id} className="low"><td>{p.name}</td><td>{p.stock}</td><td>{p.min_stock}</td></tr>)}
          {!s.lowStock.length && <tr><td colSpan="3" className="empty">Nada por reponer.</td></tr>}
        </tbody>
      </table>
    </section>
  );
}
