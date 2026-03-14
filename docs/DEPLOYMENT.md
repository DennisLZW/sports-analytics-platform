# Live Demo Deployment Plan

This document outlines options to deploy the Sports Analytics Platform for a live demo. **No code changes are assumed**—only configuration and hosting choices.

---

## Architecture Overview

- **Frontend**: React SPA (Vite), static build → needs a **static host** or **Node host** (if you use SSR later).
- **Backend**: Express (Node.js) → needs a **Node runtime**.
- **Database**: PostgreSQL → needs a **managed PostgreSQL** or a server where Postgres runs.

For a live demo, you can either:

- **Option A — All-in-one (single server)**: One VPS runs Docker (Postgres + Node backend), frontend is built and served by the same Node app or Nginx. Simpler, fewer moving parts.
- **Option B — Split (recommended for demos)**: Frontend on a static host (Vercel/Netlify), backend on a PaaS (Railway/Render), database on a managed Postgres (Neon/Supabase/Railway). No server to maintain, free tiers often enough for a demo.

Below focuses on **Option B** (split) and briefly covers Option A.

---

## Option B: Split Deployment (Frontend + Backend + DB separate)

### 1. Database (PostgreSQL)

Choose **one**:

| Provider | Notes | Free tier |
|----------|--------|-----------|
| **Neon** | Serverless Postgres, good free tier | Yes |
| **Supabase** | Postgres + optional auth (we use our own auth) | Yes |
| **Railway** | Postgres add-on, simple | Limited free |
| **Render** | Postgres add-on | 90-day free |

**Steps (generic):**

1. Create a project and a PostgreSQL database.
2. Copy the **connection string** (e.g. `postgresql://user:pass@host:5432/dbname?sslmode=require`).  
   Use this as `DATABASE_URL` for the backend.
3. Run migrations from your machine (or from CI) against this URL:
   ```bash
   cd backend
   DATABASE_URL="<your-live-url>" npx prisma migrate deploy
   npm run db:seed   # optional
   ```

---

### 2. Backend (Express / Node)

Choose **one**:

| Provider | Notes | Free tier |
|----------|--------|-----------|
| **Railway** | Easy, connects to GitHub; add Postgres or use external DB | Yes (limited) |
| **Render** | Web Service + optional Postgres | Yes |
| **Fly.io** | Global, good for demos | Yes (allowance) |
| **Cyclic** | Node-focused | Free |

**Steps (generic):**

1. Connect the repo (e.g. GitHub). Set **root** or **start directory** to `backend` if the repo is monorepo.
2. **Build**: `npm install && npx prisma generate && npm run build` (or `npx prisma generate` in build, `npm run build` for TypeScript).
3. **Start**: `npm run start` (runs `node dist/index.js`) or `node dist/index.js`.  
   Ensure the start command runs from the `backend` directory.
4. **Environment variables** (required):
   - `DATABASE_URL` — from step 1 (Database).
   - `JWT_SECRET` — a long random string (e.g. 32+ chars).
   - `PORT` — often set by the host (e.g. `process.env.PORT`); your app already uses it.
5. **CORS**: Your app uses `cors({ origin: true, credentials: true })`. For production you can later restrict `origin` to the frontend URL only (no code change needed for the first version if you keep current behavior).
6. Note the **backend URL**, e.g. `https://your-backend.railway.app` or `https://your-app.onrender.com`.

---

### 3. Frontend (Vite / React)

The frontend calls the backend at a **base URL**. Right now it likely uses a relative path like `/api` (Vite proxy in dev) or an env variable. For production you must point it to the **live backend URL**.

**Ways to set the API base URL (pick one; no code change if you already have this):**

- **Build-time env**: e.g. `VITE_API_URL=https://your-backend.railway.app` and in code `import.meta.env.VITE_API_URL` + use it in the API client base URL.
- **Same origin**: If you serve the frontend from the same host as the backend (e.g. Express serves `dist/`), then `/api` can stay as is and you configure the server to proxy or mount the API at `/api`.

**Static hosting (if frontend is built and served as static files):**

| Provider | Notes | Free tier |
|----------|--------|-----------|
| **Vercel** | Connect repo, set root to `frontend`, build = `npm run build`, output = `dist` | Yes |
| **Netlify** | Same idea; build command and publish directory | Yes |
| **Cloudflare Pages** | Same; static only | Yes |
| **GitHub Pages** | Free; need to set base path if repo is not at root domain | Yes |

**Steps (generic):**

1. Connect the repo. Set **base directory** to `frontend`.
2. **Build**: `npm install && npm run build`.
3. **Publish**: output directory = `dist`.
4. **Environment variable**: Set `VITE_API_URL` (or whatever name your app uses) to the **backend URL** from step 2 (e.g. `https://your-backend.railway.app`). Rebuild after setting.
5. Optional: **Redirects** for SPA — `/* → /index.html` (200) so client-side routing works. Vercel/Netlify usually detect this for Create React App / Vite.

---

## Option A: Single server (VPS + Docker)

- **One VPS** (e.g. DigitalOcean, Linode, Fly.io, or any VM).
- On the server:
  - **Docker Compose**: run Postgres + your backend (Node) in containers. Backend uses `DATABASE_URL` to the Postgres service name (e.g. `postgres:5432`).
  - Build the frontend locally or in CI: `cd frontend && npm run build`.
  - Serve:
    - **Option A1**: Nginx in front: Nginx serves `frontend/dist` for `/` and proxies `/api` to the Node container.
    - **Option A2**: Express serves `frontend/dist` and your API; single port (e.g. 80 or 443 with a reverse proxy for TLS).
- **Migrations**: Run once against the containerized DB, e.g. `docker compose exec backend npx prisma migrate deploy` or run from host with `DATABASE_URL` pointing to the exposed Postgres port.

No code change if the frontend is built with the correct API base URL (e.g. relative `/api` when same origin, or env when different).

---

## Checklist Before Going Live

1. **Database**: Migrations applied (`prisma migrate deploy`), optional seed run.
2. **Backend**: `DATABASE_URL`, `JWT_SECRET`, `PORT` set; start command correct; logs show “listening”.
3. **Frontend**: Build uses the **production API URL**; SPA redirect rule in place so refresh on any route works.
4. **CORS**: If frontend and backend are on different origins, CORS already allows the frontend origin (your current `origin: true` allows all; you can restrict later).
5. **HTTPS**: Prefer HTTPS for both frontend and backend (most PaaS provide it).
6. **Secrets**: Never commit `.env` or production `DATABASE_URL` / `JWT_SECRET`; use the host’s env/config only.

---

## Minimal “quick demo” path (no code change)

1. **DB**: Create a Neon (or Supabase) Postgres → copy `DATABASE_URL`.
2. **Backend**: Deploy `backend` to Railway or Render; set `DATABASE_URL`, `JWT_SECRET`; run migrations (from your machine with that `DATABASE_URL` once).
3. **Frontend**: Deploy `frontend` to Vercel or Netlify; set `VITE_API_URL` (or equivalent) to the backend URL; build and publish.
4. Open the frontend URL and test login, matches, predictions.

If your current code assumes a relative `/api` only, you will need **one** small change: make the API client use an env-driven base URL in production. That’s the only change suggested for a split deployment; the rest is configuration and hosting as above.
