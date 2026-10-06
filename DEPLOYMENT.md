# Feedants — Deployment Guide

This guide details how to deploy the **Feedants** full-stack application (Backend API, MongoDB, and Frontend) to production environments across Docker, cloud providers, web hosts, and mobile app stores.

---

## 1. Quick Start: Deploy with Docker & Docker Compose

Docker Compose provisions and orchestrates the entire stack (**MongoDB 7.0**, **Express Backend API**, and **Expo Web Frontend via Nginx**) locally or on any Linux VPS (Ubuntu/Debian) with a single command.

### Prerequisites
- Docker Engine & Docker Compose installed.

### Steps
1. **Copy the root environment configuration:**
   ```bash
   cp .env.example .env
   ```
2. **Review or adjust `.env`:**
   - Set a strong `JWT_SECRET`.
   - Configure `ALLOWED_ORIGINS` if restricting web origins.
3. **Build and start all services:**
   ```bash
   docker compose up -d --build
   ```
4. **Access the services:**
   - **Frontend Web UI:** `http://localhost:3000`
   - **Backend API Health Check:** `http://localhost:5000/api/v1/health`
   - **MongoDB:** `localhost:27017`

To view logs:
```bash
docker compose logs -f backend
```

To stop:
```bash
docker compose down
```

---

## 2. Cloud Deployment (Free / Low Cost Tier)

### Architecture Overview
```
┌─────────────────────────────────┐
│        MongoDB Atlas            │  (Free Tier Cluster: M0)
│   mongodb+srv://...feedants     │
└───────────────▲─────────────────┘
                │ MONGODB_URI
┌───────────────┴─────────────────┐
│       Backend (Render / VPS)    │  Node.js + Express API
│   https://api.yourdomain.com    │  Health Check: /api/v1/health
└───────────────▲─────────────────┘
                │ EXPO_PUBLIC_API_URL
      ┌─────────┴─────────┐
      │                   │
┌─────┴──────────┐  ┌─────┴──────────┐
│ Web (Vercel)   │  │ Mobile (EAS)   │
│ React Native   │  │ Android APK/AAB│
│ Web / PWA      │  │ iOS IPA        │
└────────────────┘  └────────────────┘
```

---

### Step A: Set Up MongoDB Atlas (Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free M0 cluster.
2. In **Database Access**, create a database user (e.g., `feedants_admin`) with password.
3. In **Network Access**, add IP `0.0.0.0/0` (allow connections from anywhere) for cloud hosting.
4. Click **Connect -> Drivers** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/feedants?retryWrites=true&w=majority
   ```

---

### Step B: Deploy Backend to Render (or Railway / Fly.io)

The project includes a ready-to-use [`render.yaml`](./render.yaml) blueprint:

1. Push your repository to GitHub.
2. Log in to [Render](https://render.com).
3. Click **New +** -> **Blueprint**, and connect your GitHub repository.
4. Render detects `render.yaml` automatically.
5. In the environment variables prompt, enter:
   - `MONGODB_URI`: Your MongoDB Atlas URI from Step A.
   - `JWT_SECRET`: A secure 32+ character random secret (or let Render generate one).
   - `ALLOWED_ORIGINS`: `*` or your frontend domain.
6. Click **Apply**.
7. Once deployed, note your public API URL: `https://feedants-backend.onrender.com`.
8. Verify health endpoint: `https://feedants-backend.onrender.com/api/v1/health`.

---

### Step C: Deploy Web Frontend to Vercel (or Netlify)

The project includes [`frontend/vercel.json`](./frontend/vercel.json) with client-side SPA routing:

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project** -> Import your GitHub repo.
3. In **Root Directory**, select `frontend`.
4. In **Build & Output Settings**:
   - Build Command: `npm run build:web`
   - Output Directory: `dist`
5. In **Environment Variables**, add:
   - `EXPO_PUBLIC_API_URL`: `https://feedants-backend.onrender.com/api/v1`
6. Click **Deploy**.

---

### Step D: Build & Deploy Mobile Apps (Android / iOS via EAS)

The project includes [`frontend/eas.json`](./frontend/eas.json):

1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log in with your Expo account:
   ```bash
   eas login
   ```
3. In `frontend/`:
   ```bash
   cd frontend
   eas project:init
   ```
4. Build a standalone Android APK (for direct testing/install):
   ```bash
   eas build -p android --profile preview
   ```
5. Build an Android App Bundle (AAB) for Google Play Store:
   ```bash
   eas build -p android --profile production
   ```
6. Build for iOS (requires Apple Developer Account):
   ```bash
   eas build -p ios --profile production
   ```

---

## 3. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | HTTP server port | `5000` |
| `NODE_ENV` | Environment (`development`, `production`, `test`) | `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing auth tokens | `secure_random_key_min_32_chars` |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins or `*` | `https://feedants.vercel.app,*` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Public base URL of backend API | `https://feedants-backend.onrender.com/api/v1` |

---

## 4. Production Checklist

- [x] **Database Auto-Seeding**: The backend auto-seeds the database on first boot if no competitions exist (`src/services/competitionService.ts`).
- [x] **Graceful Shutdown**: Handles `SIGTERM` and `SIGINT` to safely drain HTTP requests and close MongoDB connections.
- [x] **Cross-Platform Storage**: Safe storage helper (`frontend/src/utils/storage.ts`) uses `SecureStore` on iOS/Android and falls back to `localStorage` on Web.
- [x] **Multi-stage Docker Builds**: Optimized images for both backend (Alpine Node) and frontend (Nginx).
- [x] **Zero Hardcoded URLs**: API endpoint configurable via `EXPO_PUBLIC_API_URL`.
