import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';

export default function Movements({ user }) {
  const owner = user.role === 'dueno';
  const types = owner ? ['compra', 'venta', 'merma', 'ajuste', 'conteo'] : ['venta', 'merma'];
  const [type, setType] = useState(types[0]);
  const [code, setCode] = useState('');
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState(null);
  const [msg, setMsg] = useState(null);
  const [rows, setRows] = useState([]);
  const codeRef = useRef();
  const load = () => api('/movements').then(setRows);
  useEffect(() => { load(); codeRef.current?.focus(); }, []);

  // El escáner "escribe" el código y pulsa Enter
  const lookup = async (e) => {
    if (e.key !== 'Enter') return;
    try { setProduct(await api('/products/barcode/' + encodeURIComponent(code))); setMsg(null); }
    catch (x) { setProduct(null); setMsg({ error: x.message }); }
  };
  const confirm = async () => {
    try {
      const r = await api('/movements', { method: 'POST', body: { productId: product.id, type, qty: +qty } });
      setMsg({ ok: `${product.name}: stock ahora ${r.stock}` });
      setProduct(null); setCode(''); setQty(1); load(); codeRef.current.focus();
    } catch (x) { setMsg({ error: x.message }); }
  };

  return (
    <section>
      <div className="panel">
        <label>Tipo<select value={type} onChange={e => setType(e.target.value)}>{types.map(t => <option key={t}>{t}</option>)}</select></label>
        <label>Escanea o escribe el código<input ref={codeRef} value={code} onChange={e => setCode(e.target.value)} onKeyDown={lookup} /></label>
        {product && (
          <>
            <p><strong>{product.name}</strong> (stock actual: {product.stock})</p>
            <label>{type === 'conteo' ? 'Cantidad contada' : type === 'ajuste' ? 'Cantidad (+/-)' : 'Cantidad'}
              <input type="number" value={qty} onChange={e => setQty(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirm()} autoFocus />
            </label>
            <button onClick={confirm}>Registrar {type}</button>
          </>
        )}
        {msg?.error && <p className="error">{msg.error}</p>}
        {msg?.ok && <p className="ok">{msg.ok}</p>}
      </div>
      <table>
        <thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cambio</th><th>Stock</th><th>Usuario</th></tr></thead>
        <tbody>{rows.map(r => (
          <tr key={r.id}><td>{r.created_at}</td><td>{r.product}</td><td>{r.type}</td>
            <td>{r.qty > 0 ? '+' : ''}{r.qty}</td><td>{r.stock_after}</td><td>{r.username}</td></tr>
        ))}
        {!rows.length && <tr><td colSpan="6" className="empty">Sin movimientos todavía.</td></tr>}</tbody>
      </table>
    </section>
  );
}
