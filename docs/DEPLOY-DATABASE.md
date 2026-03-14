# Step 1: Deploy the database

Use a **hosted PostgreSQL** so your live backend can connect to it. This guide uses **Neon** (free tier, no credit card required).

---

## 1.1 Create a Neon account and project

1. Go to **[neon.tech](https://neon.tech)** and sign up (GitHub or email).
2. After login, click **Create a project**.
3. Choose:
   - **Project name**: e.g. `sports-analytics`
   - **Region**: pick one close to where you’ll run the backend (e.g. US East or EU).
   - **Postgres version**: 16 (default is fine).
4. Click **Create project**.

---

## 1.2 Get the connection string

1. On the project **Dashboard**, find the **Connection string** section.
2. Select the **Pooled** or **Direct** connection string (Pooled is recommended for serverless).
3. Copy the full URL. It looks like:
   ```text
   postgresql://USER:PASSWORD@HOST/dbname?sslmode=require
   ```
4. Keep this URL private. You’ll use it as `DATABASE_URL` for the backend and for running migrations below.

---

## 1.3 Run migrations against the new database

From your **local machine** (with the repo and backend deps installed), run Prisma migrations against the live database.

**One-time setup:** set the live URL for this terminal session (replace with your real URL):

```bash
cd backend
export DATABASE_URL="postgresql://USER:PASSWORD@HOST/dbname?sslmode=require"
```

**Apply migrations (creates tables):**

```bash
npx prisma migrate deploy
```

You should see output like: `Applying migration ...` for each migration. When it finishes, the remote database has the same schema as your local one.

---

## 1.4 (Optional) Seed the database

To load the sample league and matches:

```bash
# Still in backend, with DATABASE_URL set
npm run db:seed
```

You should see: `Seed done: 1 league, 3 matches with odds.`

---

## 1.5 Save the connection string for the next step

- **Do not** commit this URL to git or put it in the repo.
- You will paste it into your **backend’s environment variables** when you deploy the backend (Step 2).
- Store it somewhere safe (e.g. password manager or your deployment platform’s env config).

---

## Summary

| Step | What you did |
|------|----------------------|
| 1.1  | Created a Neon project (hosted Postgres). |
| 1.2  | Copied the connection string. |
| 1.3  | Ran `npx prisma migrate deploy` so the remote DB has all tables. |
| 1.4  | (Optional) Ran `npm run db:seed` for demo data. |
| 1.5  | Kept the URL for backend deployment. |

When you’re ready for **Step 2**, we’ll deploy the backend and set `DATABASE_URL` to this same URL.
