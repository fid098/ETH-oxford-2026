import json
from datetime import datetime
from collections import defaultdict, Counter # Added Counter here
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import claims, users, positions, auth

app = FastAPI(title="Oracle API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(claims.router, prefix="/api/claims", tags=["claims"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(positions.router, prefix="/api/positions", tags=["positions"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

@app.get("/api/analytics")
def get_analytics():
    try:
        with open("data.json", "r") as f:
            data = json.load(f)
        
        positions_list = data.get("positions", [])
        claims_list = data.get("claims", []) # Get the claims list
        
        total_tvl = sum(p["stake"] for p in positions_list)
        
        # Aggregate Stakes by Date
        daily_data = defaultdict(lambda: {"stakes_count": 0, "total_value": 0})
        for p in positions_list:
            date_str = p["created_at"].split("T")[0]
            daily_data[date_str]["stakes_count"] += 1
            daily_data[date_str]["total_value"] += p["stake"]
        
        # Sort history for the graph
        sorted_history = []
        for date in sorted(daily_data.keys()):
            sorted_history.append({
                "date": date, 
                "value": daily_data[date]["total_value"],
                "count": daily_data[date]["stakes_count"]
            })
        
        # Calculate real sentiment (Yes stakes / Total stakes)
        yes_stakes = sum(p["stake"] for p in positions_list if p["side"] == "yes")
        sentiment_val = int((yes_stakes / total_tvl * 100)) if total_tvl > 0 else 50

        # Calculate Top 3 Categories
        # This counts every category occurrence in the claims list
        category_counts = Counter(c.get("category", "other") for c in claims_list)
        top_categories = [
            {"name": cat, "count": count} 
            for cat, count in category_counts.most_common(3)
        ]

        return {
            "tvl": total_tvl,
            "sentiment": sentiment_val,
            "history": sorted_history,
            "top_categories": top_categories # Send this to the frontend
        }
    except Exception as e:
        return {"error": str(e), "tvl": 0, "sentiment": 0, "history": [], "top_categories": []}

@app.get("/api/health")
def health():
    return {"status": "ok"}