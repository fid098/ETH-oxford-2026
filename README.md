# ETH-oxford-2026

A lightweight prediction market prototype with claims, positions, and optional reasoning for each position.

**Development**
Backend:

1. `cd backend`
2. `python -m venv venv`
3. `venv\\Scripts\\activate`
4. `pip install -r requirements.txt`
5. `python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

Frontend:

1. `cd frontend`
2. `npm install`
3. `npm run dev`

**Notes**

- The Vite dev server proxies `/api` to `http://localhost:8000` (see `frontend/vite.config.ts`).
- If port `3000` is in use, Vite will choose the next available port (e.g. `3001`).
