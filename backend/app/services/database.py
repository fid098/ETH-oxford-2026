import json
from pathlib import Path
from app.models.schemas import User, Claim, Position

DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data.json"


def _read_db() -> dict:
    with open(DATA_PATH, "r") as f:
        return json.load(f)


def _write_db(data: dict) -> None:
    with open(DATA_PATH, "w") as f:
        json.dump(data, f, indent=2, default=str)


# ── Users ──────────────────────────────────────────────────

def get_all_users() -> list[User]:
    data = _read_db()
    return [User(**u) for u in data["users"]]


def get_user(username: str) -> User | None:
    data = _read_db()
    for u in data["users"]:
        if u["username"] == username:
            return User(**u)
    return None


def update_user(user: User) -> None:
    data = _read_db()
    for i, u in enumerate(data["users"]):
        if u["username"] == user.username:
            data["users"][i] = user.model_dump()
            _write_db(data)
            return
    raise ValueError(f"User {user.username} not found")


# ── Claims ─────────────────────────────────────────────────

def get_all_claims() -> list[Claim]:
    data = _read_db()
    return [Claim(**c) for c in data["claims"]]


def get_claim(claim_id: str) -> Claim | None:
    data = _read_db()
    for c in data["claims"]:
        if c["id"] == claim_id:
            return Claim(**c)
    return None


def add_claim(claim: Claim) -> None:
    data = _read_db()
    data["claims"].append(claim.model_dump())
    _write_db(data)


def update_claim(claim: Claim) -> None:
    data = _read_db()
    for i, c in enumerate(data["claims"]):
        if c["id"] == claim.id:
            data["claims"][i] = claim.model_dump()
            _write_db(data)
            return
    raise ValueError(f"Claim {claim.id} not found")


# ── Positions ──────────────────────────────────────────────

def get_all_positions() -> list[Position]:
    data = _read_db()
    return [Position(**p) for p in data["positions"]]


def get_positions_for_claim(claim_id: str) -> list[Position]:
    data = _read_db()
    return [Position(**p) for p in data["positions"] if p["claim_id"] == claim_id]


def get_positions_for_user(username: str) -> list[Position]:
    data = _read_db()
    return [Position(**p) for p in data["positions"] if p["username"] == username]


def add_position(position: Position) -> None:
    data = _read_db()
    data["positions"].append(position.model_dump())
    _write_db(data)
