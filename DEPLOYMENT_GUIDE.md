# BookMyTrip — Production Hosting Guide (Vercel + Render + MongoDB Atlas)

This guide walks you through deploying **BookMyTrip** live to production using:
- **Frontend (React/Vite)**: Hosted on **Vercel** (Global Edge CDN, Free tier)
- **Backend (Express/Node)**: Hosted on **Render** (Free Web Service)
- **Database**: **MongoDB Atlas** (Already Cloud-Hosted and Synchronized)

---

## Pre-Requisites Check
- [x] MongoDB Atlas is live and connected.
- [x] GitHub repository is linked: `https://github.com/varuntyagiG/BookMyShow1.git`
- [x] Client-side routing rewrite rule configured in `Frontend/vercel.json`.
- [x] Backend blueprint configured in `render.yaml`.

---

## Step 1: Push Latest Changes to GitHub

Run these commands in your project root:

```bash
git add .
git commit -m "Configure production hosting for Vercel and Render"
git push origin main
```

---

## Step 2: Deploy Backend on Render

1. Open **[dashboard.render.com](https://dashboard.render.com)** and sign in (using GitHub).
2. Click **New +** → **Web Service**.
3. Select your repository: **`varuntyagiG/BookMyShow1`**.
4. Configure the service settings:
   - **Name**: `bookmytrip-backend`
   - **Region**: Closest to you (e.g., *Singapore* or *Frankfurt*)
   - **Branch**: `main`
   - **Root Directory**: `Backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Scroll down to **Environment Variables** and add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production caching |
   | `MONGO_URI` | *(Your Atlas connection string from `Backend/.env`)* | Database connection |
   | `JWT_SECRET` | *(Your secret key from `Backend/.env`)* | JWT signing |
   | `FRONTEND_URL` | `*` | Update this with your Vercel URL after Step 3 |
6. Click **Create Web Service**.
7. Wait ~2 minutes for the deployment to finish. Once live, **copy your Render backend URL** (e.g., `https://bookmytrip-backend.onrender.com`).
8. You can verify health at: `https://bookmytrip-backend.onrender.com/api/health`.

---

## Step 3: Deploy Frontend on Vercel

1. Open **[vercel.com](https://vercel.com)** and sign in (using GitHub).
2. Click **Add New...** → **Project**.
3. Import **`varuntyagiG/BookMyShow1`**.
4. In the configuration screen:
   - **Framework Preset**: `Vite` (auto-detected)
   - **Root Directory**: Click **Edit** and select **`Frontend`** (CRITICAL: Do not leave as root).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand the **Environment Variables** section and add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://bookmytrip-backend.onrender.com` *(your Render backend URL from Step 2)* |
6. Click **Deploy**.
7. In ~60 seconds, Vercel will generate your live production URL (e.g., `https://bookmytrip.vercel.app`).

---

## Step 4: Final Security & CORS Lockdown

1. Copy your new live Vercel URL (e.g. `https://bookmytrip.vercel.app`).
2. Go back to your **Render Dashboard** → `bookmytrip-backend` → **Environment**.
3. Update `FRONTEND_URL` from `*` to:
   ```
   https://bookmytrip.vercel.app
   ```
4. Render will automatically redeploy with strict CORS protection.

---

## Step 5: Test All Panels in Production

| Panel | Production URL | Credentials |
| :--- | :--- | :--- |
| **Customer App** | `https://your-app.vercel.app` | `demo@bookmyshow.com` / `password123` |
| **Cinema Partner Portal** | `https://your-app.vercel.app/cinema-partner/login` | `partner@bookmyshow.com` / `password123` |
| **Platform Admin Hub** | `https://your-app.vercel.app/admin/login` | `admin@bookmyshow.com` / `password123` |
