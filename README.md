## AI-Powered Public Resource Allocation & Optimization Engine

This is a production-ready starter for an **AI-assisted public resource allocation and optimization platform** focused on rural regions.

It consists of:
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **AI Engine**: Python + FastAPI microservice for optimization
- **Gemini AI Integration**: Emergency analysis, disaster intelligence, allocation advisor, citizen chatbot

---

## High-Level Architecture

- **frontend**: SPA with dashboards for citizens and admins, map visualizations, and AI insights.
- **backend**: REST API for auth, ambulances, requests, disasters, villages/regions, and optimization orchestration.
- **ai-engine**: Independent FastAPI service that calculates **priority scores** and suggests resource allocation.
- **MongoDB**: Stores users, ambulances, requests, regions, villages, disasters.
- **Gemini**: Provides higher-level reasoning and narrative insights; final allocation still uses the system priority algorithm.

---

## Project Structure

```text
root
  frontend/           # React + Vite + Tailwind app
    src/
      components/
      pages/
      services/
      hooks/
  backend/            # Node + Express + Mongo + Gemini
    controllers/
    models/
    routes/
    middleware/
    services/
    seed/
  ai-engine/          # Python FastAPI microservice
    main.py
    optimization.py
```

---

## Setup Instructions

### 1. Prerequisites

- Node.js (LTS)
- Python 3.10+
- MongoDB instance (local or cloud, e.g. MongoDB Atlas)
- A valid **Google Gemini** API key

---

### 2. Backend Setup (`backend`)

```bash
cd backend
npm install
```

Create a `.env` file in `backend`:

```bash
MONGODB_URI=mongodb://localhost:27017/resource_engine
JWT_SECRET=super-secret-jwt-key
GEMINI_API_KEY=your_gemini_api_key_here
AI_ENGINE_BASE_URL=http://localhost:8000
PORT=5000
```

Run seed script (optional, after implementing `seed/seedData.js`):

```bash
node seed/seedData.js
```

Start backend:

```bash
npm run dev
```

---

### 3. AI Engine Setup (`ai-engine`)

```bash
cd ai-engine
python -m venv .venv
.\.venv\Scripts\activate   # Windows PowerShell
pip install -r requirements.txt
```

Run the FastAPI service:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

### 4. Frontend Setup (`frontend`)

```bash
cd frontend
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

Configure a `.env` file in `frontend` as needed:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Seed Credentials

After running `npm run seed` in `backend`:

| Role   | Phone       | Password  |
|--------|-------------|-----------|
| Admin  | 9990000001  | admin123  |
| Citizen| 9990000002  | citizen123|

---

## Core Flows

- **Citizen**
  - Registers or logs in (or uses the public AI Help Bot on the landing page).
  - Submits ambulance request with location, severity, and description.
  - Backend calls **Gemini** to analyze free-text description and enrich the request.
  - Backend uses **AI Engine** to compute priority and allocation suggestions.
  - Citizen can track live ambulance status on the map.

- **Admin**
  - Manages ambulances, hospitals, regions, villages.
  - Views real-time map with ambulances, hospitals, disasters, and requests.
  - Creates **Disaster Events** and sees required resources + suggested allocations.
  - Uses **AI Insights Panels** for disaster intelligence and allocation advice.

---

## Notes

- This repository is a **skeleton with example implementations**. It is structured for production readiness, but you should:
  - Add proper logging, rate limiting, and production-grade security.
  - Add validation and stricter typing where appropriate.
  - Harden error handling and integrate monitoring.

