from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime, timezone


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ── Domain Models ──────────────────────────────────────────

class User(BaseModel):
    username: str
    display_name: str
    wallet_address: str | None = None
    points: float = 1000.0
    created_at: datetime = Field(default_factory=_utcnow)


class Claim(BaseModel):
    id: str
    title: str
    description: str
    category: str
    status: Literal["active", "resolved_yes", "resolved_no"] = "active"
    created_at: datetime = Field(default_factory=_utcnow)
    resolved_at: datetime | None = None
    created_by: str | None = None
    resolution_type: Literal["manual", "oracle"] = "manual"
    resolution_date: datetime | None = None
    oracle_config: dict | None = None


class Position(BaseModel):
    id: str
    claim_id: str
    username: str
    side: Literal["yes", "no"]
    stake: float
    confidence: float = Field(ge=0.5, le=0.99)
    created_at: datetime = Field(default_factory=_utcnow)
    reasoning: str | None = None


# ── Request / Response Schemas ─────────────────────────────

class CreateClaimRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=2000)
    category: str = Field(min_length=1, max_length=50)
    created_by: str | None = None
    resolution_type: Literal["manual", "oracle"] = "manual"
    resolution_date: datetime | None = None
    oracle_config: dict | None = None


class CreatePositionRequest(BaseModel):
    claim_id: str
    username: str
    side: Literal["yes", "no"]
    stake: float = Field(gt=0)
    confidence: float = Field(ge=0.5, le=0.99)
    reasoning: str | None = Field(default=None, max_length=500)


class ResolveClaimRequest(BaseModel):
    resolution: Literal["yes", "no"]
    username: str


class ClaimWithOdds(BaseModel):
    id: str
    title: str
    description: str
    category: str
    status: Literal["active", "resolved_yes", "resolved_no"]
    created_at: datetime
    resolved_at: datetime | None = None
    created_by: str | None = None
    resolution_type: Literal["manual", "oracle"] = "manual"
    resolution_date: datetime | None = None
    oracle_config: dict | None = None
    yes_percentage: float
    no_percentage: float
    total_staked: float
    position_count: int


class UserProfile(BaseModel):
    username: str
    display_name: str
    wallet_address: str | None = None
    points: float
    accuracy: float | None = None
    total_resolved: int = 0
    category_stats: dict[str, dict] = {}
    active_positions: list[Position] = []
    resolved_positions: list[Position] = []
