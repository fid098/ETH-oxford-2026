from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime


# ── Domain Models ──────────────────────────────────────────

class User(BaseModel):
    username: str
    display_name: str
    points: float = 1000.0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Claim(BaseModel):
    id: str
    title: str
    description: str
    category: str
    status: Literal["active", "resolved_yes", "resolved_no"] = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: datetime | None = None


class Position(BaseModel):
    id: str
    claim_id: str
    username: str
    side: Literal["yes", "no"]
    stake: float
    confidence: float = Field(ge=0.5, le=0.99)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reasoning: str | None = None


# ── Request / Response Schemas ─────────────────────────────

class CreateClaimRequest(BaseModel):
    title: str
    description: str
    category: str


class CreatePositionRequest(BaseModel):
    claim_id: str
    username: str
    side: Literal["yes", "no"]
    stake: float = Field(gt=0)
    confidence: float = Field(ge=0.5, le=0.99)
    reasoning: str | None = Field(default=None, max_length=500)


class ResolveClaimRequest(BaseModel):
    resolution: Literal["yes", "no"]


class ClaimWithOdds(BaseModel):
    id: str
    title: str
    description: str
    category: str
    status: Literal["active", "resolved_yes", "resolved_no"]
    created_at: datetime
    resolved_at: datetime | None = None
    yes_percentage: float
    no_percentage: float
    total_staked: float
    position_count: int


class UserProfile(BaseModel):
    username: str
    display_name: str
    points: float
    accuracy: float | None = None
    total_resolved: int = 0
    category_stats: dict[str, dict] = {}
    active_positions: list[Position] = []
    resolved_positions: list[Position] = []
