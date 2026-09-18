# Web — Distrito 58 · Bloque de Básicos

Frontend Vite + React (mobile-first) para jueces, organización y podio público.

## Rutas

- `/` — PIN de 4 dígitos
- `/panel` — Carriles, cronómetros, marca_circuito y envío de resultados
- `/podio` — Tabla pública (se refresca sola)
- `/admin` — Alertas de exclusión (PIN de organización)

## Render (Static Site)

1. Build: `npm install && npm run build`
2. Publish directory: `dist`
3. Variable `VITE_API_URL` = URL del backend (ej. `https://tu-api.onrender.com`)
4. En el backend, `CLIENT_ORIGIN` = URL de este sitio.

En local: `npm run dev` (proxy a `localhost:3001`).
