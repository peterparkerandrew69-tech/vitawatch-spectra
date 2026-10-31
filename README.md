# VitaWatch Spectra — Biometric Telemetry & Cyber-Medical Full-Stack Platform

[![Python](https://img.shields.io/badge/Python-3.10-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1-black.svg)](https://flask.palletsprojects.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%20%7C%20PostgreSQL-green.svg)](https://www.sqlite.org/)

**VitaWatch Spectra** is a full-stack, cyber-medical wellness surveillance platform combining high-frequency IoT wearable sensor ingestion (ESP32-S3), persistent database architecture, personalized statistical baseline analytics, context-aware emergency workflows with live hospital GPS routing & relatives dispatch, and a glassmorphic interface with modern premium typography (**Space Grotesk** & **JetBrains Mono**).

---

## 1. System Architecture

```
ESP32 Wearable (MAX30102, MPU6050, Temp, GSR)
       |
       v (HTTPS / BLE Companion Proxy)
[POST /api/devices/ingest]
       |
       v
Flask 3.1 Modular Backend (Port 5000)
  ├── SQLAlchemy ORM (SQLite / PostgreSQL)
  ├── JWT Auth & Role-Based Authorization
  ├── ML Analytics & Statistical Baseline Service
  ├── Contextual Emergency Pipeline & Audit Trail
  └── Server-Sent Events (SSE) Live Telemetry Stream
       |
       v (Real-Time SSE & REST APIs)
Next.js App Router (Port 3000)
  ├── Module 1: Hero Landing & AI Copilot Preview
  ├── Module 2: Biometric Command Deck (ECG, Vitals, Heatmap, Timeline)
  ├── Module 3: AI Analytics Engine (Stress, Recovery, Interactive Copilot)
  ├── Module 4: AR Cognitive Lab (Visual Reflex Benchmark, Leaderboard)
  ├── Module 5: Emergency Response Center (Tactical GPS, Voice SOS, State Machine)
  ├── Module 6: Caregiver Command Deck (Multi-Patient Telemetry, Alerts)
  └── Module 7: Settings & Identity (Biometric Device Mesh, Profile Persistence)
```

---

## 2. Quickstart & Startup Commands

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Terminal 1: Start Flask Backend (Port 5000)
```bash
# From repository root
py app.py
```
*The backend starts at `http://127.0.0.1:5000`, automatically creates all database tables in `backend/vitawatch_spectra.db`, and seeds initial test users (`sandeep@vitawatch.ai` / `Spectra2026!`).*

### Terminal 2: Start Next.js Frontend (Port 3000)
```bash
cd frontend
npm run dev
```
*Open `http://localhost:3000` in your browser.*

### Running Automated Test Suite
```bash
py -m unittest backend\tests\test_api.py
```
*Executes all 20 end-to-end acceptance tests covering health checks, user isolation, emergency state machines, device ingestion, and statistical analytics.*

---

## 3. ESP32 Hardware Simulation & Testing

To simulate live sensor transmissions from the **ESP32-S3** wearable (MAX30102 PPG, MPU6050 IMU, DS18B20 Temp, GSR):

```bash
# Transmit 10 live telemetry frames to http://127.0.0.1:5000/api/devices/ingest
py scripts/simulate_esp32.py 10
```

When transmitted, the dashboard status badge instantly transitions from `DEMO / SIMULATED DATA` to **`LIVE SENSOR DATA`**.

---

## 4. Default Development Credentials

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Patient** | `sandeep@vitawatch.ai` | `Spectra2026!` | Primary user profile, personal telemetry, and cognitive trials |
| **Caregiver** | `dr.elena@spectra-health.org` | `Spectra2026!` | Attending specialist with consent-authorized patient view |

---

## 5. REST API Documentation

### A. Health & Diagnostics
- `GET /api/health`
  - **Auth**: None
  - **Response**: `{ "status": "ok", "application": "VitaWatch Spectra", "backend": "running", "database": "connected", "mode": "demo" }`

### B. Authentication & Authorization
- `POST /api/auth/register` — Register new user account.
- `POST /api/auth/login` — Login with email/password; returns JWT and sets HttpOnly cookie.
- `POST /api/auth/logout` — Invalidate session and clear cookie.
- `GET /api/auth/me` — Return current authenticated user profile.
- `PUT /api/auth/profile` — Update user biometrics and profile fields.

### C. Dashboard & Telemetry
- `GET /api/dashboard/summary` — Returns user vitals, 24h ECG points, wellness index, device status, and honest provenance badge (`LIVE SENSOR DATA` vs `DEMO / SIMULATED DATA`).
- `GET /api/dashboard/activity` — Persisted timeline chronology.

### D. Physiological Vitals
- `POST /api/vitals` — Ingest validated reading (validates HR [30-250], SpO2 [50-100%], Temp [30-45°C / 80-115°F]).
- `GET /api/vitals/latest` — Authenticated user's latest reading.
- `GET /api/vitals/history?hours=24` — Historical time-series vitals.

### E. Device Management & IoT Ingestion
- `POST /api/devices/register` — Register hardware device.
- `POST /api/devices/ingest` — Authenticated hardware gateway ingestion (`X-Device-Key`).

### F. AI Analytics
- `GET /api/analytics/summary` — Comprehensive non-diagnostic recovery, stress, and fatigue indicators.
- `POST /api/analytics/chat` — Contextual AI Copilot consultation referencing real user vitals.

### G. AR Cognitive Lab
- `POST /api/cognitive/sessions` — Record validated reaction test trial (validates human physical limit $\ge 100\,\text{ms}$).
- `GET /api/cognitive/leaderboard` — Anonymized, validated leaderboard.

### H. Emergency Response Center
- `POST /api/emergency/events` — Dispatch SOS distress event (duplicate suppressed within 45s).
- `POST /api/emergency/events/<id>/acknowledge` — State transition to `acknowledged`.
- `POST /api/emergency/events/<id>/resolve` — State transition to `resolved` or `cancelled` (false alarm).

### I. Real-Time Streaming
- `GET /api/stream/vitals?token=<token>` — Server-Sent Events (SSE) live stream yielding continuous vital telemetry, signal quality, and active emergency alerts.

---

## 6. Deployment Guide (Vercel & Full-Stack)

### Architecture in Production
- **Frontend**: Hosted on **Vercel** (Next.js 16 with automatic Edge CDN, SSR, and Turbopack optimizations).
- **Backend**: Hosted on **Render**, **Railway**, **Fly.io**, or any cloud VM / Docker container (handling persistent SQLite/PostgreSQL, ML models, and high-frequency ESP32 sensor streams).

---

### Step 1: Deploy Frontend to Vercel

#### Method A: Via Vercel Web Dashboard (Recommended)
1. Push your repository to GitHub: `https://github.com/peterparkerandrew69-tech/vitawatch-spectra`.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your **`vitawatch-spectra`** repository.
4. In the configuration screen:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select **`frontend`** (or keep root `./` as `vercel.json` is pre-configured).
5. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_BASE_URL` = URL of your backend (e.g. `https://vitawatch-backend.onrender.com` or leave empty for demo mode).
6. Click **Deploy**.

#### Method B: Via Vercel CLI
```bash
# Log in to Vercel
vercel login

# Deploy the frontend
cd frontend
vercel --prod
```

---

### Step 2: Deploy Backend (Render / Railway / Docker)

The backend includes a pre-configured `render.yaml`, `Procfile`, and `Dockerfile`.

#### Deploying on Render (Free / 1-Click Blueprint)
1. Go to [render.com](https://render.com) and click **New > Blueprint**.
2. Select your `vitawatch-spectra` repository.
3. Render reads `render.yaml` and deploys the Flask application automatically using `gunicorn app:app`.
4. Copy your backend URL (e.g., `https://vitawatch-spectra-backend.onrender.com`).
5. Add this URL to your Vercel project's environment variables as `NEXT_PUBLIC_API_BASE_URL`.

---

## 7. Security, Privacy & Non-Diagnostic Disclosure

1. **Non-Diagnostic Notice**: VitaWatch Spectra provides wellness insights and educational biotelemetry tracking. It is **not** an FDA-approved medical diagnostic device.
2. **Honest Delivery Status**: Emergency alert deliveries are tracked with genuine provider checks. When Twilio or SendGrid credentials are not configured, delivery status is accurately reported as `not_configured` rather than pretending alerts were delivered.
3. **Anonymized Research**: Research dataset queries enforce strict $k$-anonymity, removing all names, emails, and exact coordinates.
