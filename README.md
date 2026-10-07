# Inventario Kiosko (base)

Node + Express + SQLite (better-sqlite3) · React + Vite.

## Uso
    npm run install:all
    npm run dev          # API :3001 + web :5173
    npm run build && npm start   # producción: todo en http://localhost:3001

Usuario inicial: `admin` / `admin123` (cámbialo). Variables: `JWT_SECRET`, `DATA_DIR`, `PORT`.
La base queda en `server/data/kiosko.db`. Requiere Node 18+.

## Qué incluye
Login con roles (dueño/cajero), CRUD de productos, movimientos de stock transaccionales
(compra, venta, merma, ajuste, conteo) con escáner, historial, resumen y stock bajo.

## Pendiente (siguientes pasos)
- Gestión de usuarios y cambio de clave · categorías en la UI
- Importar productos desde Excel/CSV · importar reporte de ventas del equipo de boletas (perfiles por proveedor)
- Respaldo automático (`db.backup()`) · licencia atada al PC · pruebas de la lógica de stock
- Arranque como servicio (NSSM/PM2) · empaquetado Electron/Tauri (opcional)
