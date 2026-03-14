# Sports Analytics Platform

Full-stack sports match tracking and prediction MVP: browse matches and odds, save matches to a watchlist, submit predictions, and view summaries and crowd prediction distribution on the dashboard.

## Features

- **Auth**: Register, login, JWT, protected routes
- **Matches**: Leagues and match list, match detail, odds history chart
- **Watchlist**: Add matches to a watchlist and manage them (login required)
- **Predictions**: Submit home/draw/away and confidence on match detail; view in "My Predictions" (login required)
- **Prediction verification**: Finished matches are auto-evaluated as correct/incorrect; shown in "My Predictions" and dashboard recent predictions
- **Crowd prediction distribution**: Match detail shows all users’ prediction distribution (home/draw/away counts and %) alongside odds
- **Dashboard**: Upcoming count, watchlist count, prediction count, prediction stats (finished matches and accuracy), upcoming list and recent predictions (more when logged in)
- **Settings**: Change display name and password; changing password forces re-login (login required)

## Live deployment

The app is deployed and usable in the browser:

| What   | URL |
|--------|-----|
| **App (frontend)** | [https://frontend-navy-three-61.vercel.app](https://frontend-navy-three-61.vercel.app) |
| **API (backend)**  | [https://backend-production-203d.up.railway.app](https://backend-production-203d.up.railway.app) |
| **Health check**   | [https://backend-production-203d.up.railway.app/api/health](https://backend-production-203d.up.railway.app/api/health) |

- **Database**: Neon (PostgreSQL)
- **Backend**: Railway
- **Frontend**: Vercel

Deployment steps are in the `docs/` folder: database ([DEPLOY-DATABASE.md](docs/DEPLOY-DATABASE.md)), backend ([DEPLOY-BACKEND.md](docs/DEPLOY-BACKEND.md)), frontend ([DEPLOY-FRONTEND.md](docs/DEPLOY-FRONTEND.md)); overview in [DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Tech stack

| Layer    | Tech                                                                                |
| -------- | ----------------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, React Router, TanStack Query, Axios, Recharts, Tailwind |
| Backend  | Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, bcrypt                       |
| Database | PostgreSQL (run locally with Docker)                                                |

## Project structure

```
sports-analytics-platform/
├── backend/          # Express API
│   ├── prisma/      # schema, migrations, seed
│   └── src/         # routes, controllers, services, middleware
├── frontend/        # React SPA
│   └── src/         # pages, components, api, contexts
├── docker-compose.yml   # PostgreSQL container only
├── .env.example        # root: Docker (POSTGRES_*)
└── README.md
```

## Prerequisites

- **Node.js** 18+
- **Docker** (optional, for local PostgreSQL; recommended)
- Without Docker: install PostgreSQL locally or use a cloud database

## Quick start

### 1. Start the database with Docker (recommended)

In the project root:

```bash
cp .env.example .env   # optional: change POSTGRES_USER / PASSWORD etc.
docker compose up -d
```

Postgres is exposed on host port **5433** by default (to avoid conflict with local 5432).

### 2. Configure backend env

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

- **DATABASE_URL**: For the Docker setup above, use  
  `postgresql://sports:sports_secret@localhost:5433/sports_analytics`  
  (If you changed root `.env` POSTGRES\_\*, keep this in sync; port must match POSTGRES_PORT.)
- **JWT_SECRET**: Any random string, at least 32 characters
- **PORT**: Optional, default 3001

### 3. Install deps and run migrations

```bash
cd backend
npm install
npx prisma migrate dev --name init   # first time or after schema changes
npm run db:seed                       # optional: seed leagues and sample matches
```

### 4. Start backend and frontend

**Terminal 1 — backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 — frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** to register, login, browse matches, and use watchlist and predictions.

## Environment variables

| Location       | Variable                                                             | Description                                      |
| -------------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| Root `.env`    | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` | Used by `docker compose`; default port 5433      |
| `backend/.env` | `DATABASE_URL`                                                       | PostgreSQL connection string; must match your DB |
| `backend/.env` | `JWT_SECRET`                                                         | Token signing secret; use ≥32 chars              |
| `backend/.env` | `PORT`                                                               | Backend port; default 3001                       |

## Scripts

| Where    | Command               | Description                                        |
| -------- | --------------------- | -------------------------------------------------- |
| backend  | `npm run dev`         | Start dev server (tsx + nodemon)                   |
| backend  | `npm run build`       | Compile TypeScript to dist                         |
| backend  | `npm run db:generate` | Generate Prisma Client                             |
| backend  | `npm run db:migrate`  | Run migrations (interactive, `prisma migrate dev`) |
| backend  | `npm run db:seed`     | Seed leagues and sample matches                    |
| backend  | `npm run test:smoke`  | Auth API smoke test (backend must be running)      |
| frontend | `npm run dev`         | Start Vite dev server                              |
| frontend | `npm run build`       | Production build                                   |

## Viewing and using the database

- **Prisma Studio** (recommended): From `backend`, run `npx prisma studio`; open http://localhost:5555 to browse and edit data.
- **psql in Docker**: `docker exec -it sports-analytics-db psql -U sports -d sports_analytics`; then use `\dt`, SQL, etc.
- **Schema changes**: Edit `backend/prisma/schema.prisma`, then run `npx prisma migrate dev --name description`.
- **Reset DB** (deletes all data): `npx prisma migrate reset` (dev only).

## FAQ

- **Backend 500 or DB connection failed**  
  Ensure `DATABASE_URL` in `backend/.env` matches your database. With Docker, ensure `docker compose up -d` is running and the port (e.g. 5433) matches. Run migrations and start the backend from the **backend** directory so `.env` is loaded.

- **Port 5432 in use**  
  `docker-compose.yml` uses host port **5433** by default. To change it, set `POSTGRES_PORT` in the root `.env` and update `DATABASE_URL` in `backend/.env` accordingly.

- **Frontend /api requests fail**  
  Vite proxies `/api` to `http://localhost:3001`. Ensure the backend is running on 3001 (or whatever `PORT` is in `backend/.env`).

## License

ISC
