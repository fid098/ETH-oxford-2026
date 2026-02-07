from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import claims, users, positions, auth

app = FastAPI(title="Oracle API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(claims.router, prefix="/api/claims", tags=["claims"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(positions.router, prefix="/api/positions", tags=["positions"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
