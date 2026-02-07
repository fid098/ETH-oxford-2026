import uuid
from fastapi import APIRouter, HTTPException
from app.models.schemas import Position, CreatePositionRequest
from app.services import database

router = APIRouter()


@router.get("/", response_model=list[Position])
def list_positions():
    return database.get_all_positions()


@router.post("/", response_model=Position, status_code=201)
def create_position(req: CreatePositionRequest):
    # Validate user exists
    user = database.get_user(req.username)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # Validate claim exists and is active
    claim = database.get_claim(req.claim_id)
    if claim is None:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.status != "active":
        raise HTTPException(status_code=400, detail="Claim is already resolved")

    # Validate sufficient points
    if user.points < req.stake:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient points: have {user.points}, need {req.stake}",
        )

    # Deduct points
    updated_user = user.model_copy(update={"points": user.points - req.stake})
    database.update_user(updated_user)

    reasoning = req.reasoning.strip() if req.reasoning else None
    if reasoning == "":
        reasoning = None

    # Create position
    position = Position(
        id=f"pos-{uuid.uuid4().hex[:8]}",
        claim_id=req.claim_id,
        username=req.username,
        side=req.side,
        stake=req.stake,
        confidence=req.confidence,
        reasoning=reasoning,
    )
    database.add_position(position)
    return position
