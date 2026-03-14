# Step 2: Deploy the backend

Deploy the Express backend to a Node host so the live frontend can call it. This guide uses **Railway** (simple, free tier available). You can use **Render** instead with similar steps.

**Before you start:** You need the **Neon connection string** from Step 1 (database). Have it ready for the environment variables.

---

## 2.1 Push your code to GitHub (if not already)

Railway and Render deploy from a Git repo.

1. Create a **GitHub repository** (if you don’t have one yet).
2. In your project root, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` and `YOUR_REPO` with your repo. Use `master` if your default branch is `master`.

---

## 2.2 Create a Railway project and deploy from GitHub

1. Go to **[railway.app](https://railway.app)** and sign in (GitHub is easiest).
2. Click **New Project**.
3. Choose **Deploy from GitHub repo**.
4. Select your **sports-analytics-platform** repo (or the one that contains `backend/`). Authorize Railway if asked.
5. After the repo is connected, Railway may add a default service. We need to point it at the **backend** folder.

---

## 2.3 Set the backend as the service root

Your repo has both `frontend/` and `backend/`. The backend must run from the `backend` directory.

1. Click the new **service** (the box that represents your app).
2. Open the **Settings** tab (or **Variables** and then look for service settings).
3. Find **Root Directory** (or **Source** → **Root Directory**).
4. Set it to: **`backend`**.
5. Save.

---

## 2.4 Set build and start commands

In the same service **Settings**:

1. **Build Command** (optional if Railway auto-detects; if not, set explicitly):
   ```bash
   npm install && npx prisma generate && npm run build
   ```
2. **Start Command**:
   ```bash
   npm run start
   ```
   (This runs `node dist/index.js`.)

If Railway detects a Node app and runs `npm install` and `npm run build` by default, you only need to ensure **Start Command** is `npm run start`. If Prisma is missing at runtime, add a custom Build Command that includes `npx prisma generate`.

---

## 2.5 Add environment variables

1. In the service, open the **Variables** tab (or **Settings** → **Variables**).
2. Add these variables (use “Add variable” or “New variable”):

| Name           | Value                                                    | Note                                         |
| -------------- | -------------------------------------------------------- | -------------------------------------------- |
| `DATABASE_URL` | Your **Neon connection string** (full URL with password) | From Step 1                                  |
| `JWT_SECRET`   | A long random string (e.g. 32+ characters)               | Generate one; e.g. `openssl rand -base64 32` |
| `PORT`         | Leave **empty** or leave as set by Railway               | Railway sets `PORT` automatically            |

3. Save. Railway will redeploy when variables change.

**Important:** Do not commit `.env` or these values to Git. They exist only in Railway (and in your Neon dashboard for the DB URL).

---

## 2.6 Deploy and get the URL

1. Trigger a deploy if it didn’t start automatically: **Deploy** or **Redeploy** in the dashboard.
2. Wait for the build to finish (Build → Start). Check the **Deployments** or **Logs** tab for errors.
3. In **Settings** (or the service card), find **Networking** or **Generate domain**.
4. Click **Generate domain** (or **Add public URL**). Railway will assign a URL like `https://your-app-name.up.railway.app`.
5. Copy this **backend URL**. You will use it in Step 3 (frontend) as the API base URL.

---

## 2.7 Check that the backend is running

1. In the browser, open: `https://YOUR-RAILWAY-URL/api/health`  
   You should see something like: `{"ok":true}`.
2. Optionally test: `https://YOUR-RAILWAY-URL/api/leagues`  
   You should get JSON (e.g. leagues list or empty array).

If you get 404 or 502, check:

- **Root Directory** is `backend`.
- **Start Command** is `npm run start`.
- **Variables**: `DATABASE_URL` and `JWT_SECRET` are set; no typos.
- **Logs**: In Railway, open the latest deployment logs and fix any startup errors (e.g. missing Prisma client → ensure build runs `npx prisma generate`).

---

## Summary

| Step | What you did                                                             |
| ---- | ------------------------------------------------------------------------ |
| 2.1  | Pushed code to GitHub.                                                   |
| 2.2  | Created a Railway project and connected the repo.                        |
| 2.3  | Set Root Directory to `backend`.                                         |
| 2.4  | Set Build (with `prisma generate`) and Start (`npm run start`) commands. |
| 2.5  | Set `DATABASE_URL` and `JWT_SECRET`.                                     |
| 2.6  | Generated a public URL and copied the backend URL.                       |
| 2.7  | Checked `/api/health` (and optionally `/api/leagues`).                   |

**Next:** In Step 3 you’ll deploy the frontend and set its API base URL to this backend URL.

---

## Alternative: Deploy on Render

1. Go to **[render.com](https://render.com)** → Sign in → **New** → **Web Service**.
2. Connect your GitHub repo.
3. **Root Directory**: `backend`.
4. **Build Command**: `npm install && npx prisma generate && npm run build`.
5. **Start Command**: `npm run start`.
6. **Environment**: Add `DATABASE_URL` and `JWT_SECRET`. Render sets `PORT` automatically.
7. Create Web Service. After deploy, copy the URL (e.g. `https://your-service.onrender.com`) and use it as the API URL for the frontend.
