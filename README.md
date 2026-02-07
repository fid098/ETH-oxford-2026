# ETH-oxford-2026

Get started

cd frontend
npm install

cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

to run the project
cd frontend
npm run dev

cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
