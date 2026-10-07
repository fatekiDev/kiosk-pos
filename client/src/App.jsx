import { useState } from 'react';
import { api, setToken } from './api.js';
import Products from './pages/Products.jsx';
import Movements from './pages/Movements.jsx';
import Reports from './pages/Reports.jsx';

function Login({ onLogin }) {
  const [f, setF] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try { const r = await api('/login', { method: 'POST', body: f }); setToken(r.token); onLogin(r.user); }
    catch (x) { setErr(x.message); }
  };
  return (
    <form className="login" onSubmit={submit}>
      <h1>Inventario del kiosko</h1>
      <input placeholder="Usuario" autoFocus value={f.username} onChange={e => setF({ ...f, username: e.target.value })} />
      <input placeholder="Clave" type="password" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
      {err && <p className="error">{err}</p>}
      <button>Entrar</button>
    </form>
  );
}

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [tab, setTab] = useState('movements');
  if (!user) return <Login onLogin={(u) => { localStorage.setItem('user', JSON.stringify(u)); setUser(u); }} />;
  const owner = user.role === 'dueno';
  const tabs = [['movements', 'Movimientos'], ...(owner ? [['products', 'Productos'], ['reports', 'Resumen']] : [])];
  return (
    <>
      <header>
        <strong>Inventario</strong>
        <nav>{tabs.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</nav>
        <button className="ghost" onClick={() => { setToken(null); localStorage.removeItem('user'); setUser(null); }}>Salir ({user.username})</button>
      </header>
      <main>
        {tab === 'movements' && <Movements user={user} />}
        {tab === 'products' && owner && <Products />}
        {tab === 'reports' && owner && <Reports />}
      </main>
    </>
  );
}
