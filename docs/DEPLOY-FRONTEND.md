# Step 3: Deploy the frontend

Deploy the React (Vite) frontend to a static host so users can access the app in the browser. This guide uses **Vercel** (simple, free tier). You can use **Netlify** with similar steps.

**Before you start:** You need the **backend API base URL** from Step 2, including `/api` (e.g. `https://backend-production-203d.up.railway.app/api`). The frontend will call this URL for all API requests.

---

## 3.1 Set the API URL (build-time)

The frontend uses `VITE_API_URL` at **build time** to know where the backend lives. If unset, it falls back to `/api` (dev proxy).

| Name            | Value                          | Note                                      |
| --------------- | ------------------------------ | ----------------------------------------- |
| `VITE_API_URL`  | Backend **API base** URL, **including** `/api` (no trailing slash) | e.g. `https://backend-production-203d.up.railway.app/api` |

The app sends paths like `/auth/login`, `/leagues`; the base URL must end with `/api` so requests hit `/api/auth/login`, `/api/leagues`, etc.

---

## 3.2 Deploy with Vercel

### Option A: Vercel dashboard (from GitHub)

1. Go to **[vercel.com](https://vercel.com)** and sign in (e.g. with GitHub).
2. Click **Add New** → **Project**.
3. **Import** your `sports-analytics-platform` repo. Authorize Vercel if asked.
4. Configure the project:
   - **Root Directory**: click **Edit**, set to **`frontend`**.
   - **Framework Preset**: Vite (usually auto-detected).
   - **Build Command**: `npm run build` (default).
   - **Output Directory**: `dist` (default).
   - **Environment Variables**: Add:
     - Name: `VITE_API_URL`  
     - Value: `https://backend-production-203d.up.railway.app/api` (your backend URL **with /api**).
5. Click **Deploy**. When it finishes, Vercel gives you a URL like `https://your-project.vercel.app`.

### Option B: Vercel CLI (terminal)

1. **Log in (one-time):** In a terminal, run `npx vercel login` and complete sign-in in the browser.
2. **Link the project (one-time):** From the repo root, run `cd frontend` then `npx vercel link --yes` (or `npx vercel link` to pick an existing project).
3. **Deploy from the `frontend` folder** (backend URL is set at build time):
   ```bash
   cd frontend
   npx vercel env add VITE_API_URL production
   ```
   When prompted, enter your backend API base URL (e.g. `https://backend-production-203d.up.railway.app/api`), then:
   ```bash
   npx vercel --prod
   ```
   The first run may ask you to link the project (accept defaults). For later deploys, just run `npx vercel --prod` from `frontend`.
3. **One-shot deploy with env in one line** (after login):
   ```bash
   cd frontend
   echo "https://backend-production-203d.up.railway.app/api" | npx vercel env add VITE_API_URL production
   npx vercel --prod
   ```

---

## 3.3 Deploy with Netlify (alternative)

1. Go to **[netlify.com](https://netlify.com)** → **Add new site** → **Import an existing project**.
2. Connect your GitHub repo and select it.
3. Settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   - **Environment variables**: Add `VITE_API_URL` = your backend API base URL with `/api` (e.g. `https://backend-production-203d.up.railway.app/api`).
4. Deploy. Your site will be at `https://something.netlify.app`.

---

## 3.4 Check that the frontend works

1. Open the deployed frontend URL in the browser.
2. You should see the app (Dashboard / Matches / etc.).
3. Try **Log in** or **Register**—requests should go to your backend; if backend and DB are up, auth and data will work.
4. If you see network errors, check:
   - `VITE_API_URL` is set to the backend API base URL ending with `/api` (e.g. `https://xxx.up.railway.app/api`).
   - Backend is reachable: open `https://YOUR-BACKEND-URL/api/health` in the browser and confirm `{"ok":true}`.
   - CORS: the backend already allows any origin (`origin: true`); if you restrict it later, add your frontend origin.

---

## Summary

| Step   | What you did                                                                 |
| ------ | ---------------------------------------------------------------------------- |
| 3.1    | Set `VITE_API_URL` = backend API base URL ending with `/api`.                 |
| 3.2/3.3| Deployed frontend (Vercel or Netlify) with Root = `frontend`, set env var.   |
| 3.4    | Opened the frontend URL and tested login/data.                               |

**Next:** You’re done with the split deployment. Optional: add a custom domain for frontend or backend in Vercel/Railway.
