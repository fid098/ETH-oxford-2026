import uuid
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    Claim,
    ClaimWithOdds,
    CreateClaimRequest,
    ResolveClaimRequest,
)
from app.services import database, odds
from app.services.resolution import resolve_claim

router = APIRouter()


@router.get("/", response_model=list[ClaimWithOdds])
def list_claims():
    claims = database.get_all_claims()
    result = []
    for claim in claims:
        positions = database.get_positions_for_claim(claim.id)
        yes_pct, no_pct = odds.calculate_odds(positions)
        result.append(
            ClaimWithOdds(
                **claim.model_dump(),
                yes_percentage=yes_pct,
                no_percentage=no_pct,
                total_staked=sum(p.stake for p in positions),
                position_count=len(positions),
            )
        )
    return result


@router.get("/{claim_id}", response_model=ClaimWithOdds)
def get_claim(claim_id: str):
    claim = database.get_claim(claim_id)
    if claim is None:
        raise HTTPException(status_code=404, detail="Claim not found")

    positions = database.get_positions_for_claim(claim_id)
    yes_pct, no_pct = odds.calculate_odds(positions)
    return ClaimWithOdds(
        **claim.model_dump(),
        yes_percentage=yes_pct,
        no_percentage=no_pct,
        total_staked=sum(p.stake for p in positions),
        position_count=len(positions),
    )


@router.post("/", response_model=Claim, status_code=201)
def create_claim(req: CreateClaimRequest):
    if req.created_by:
        user = database.get_user(req.created_by)
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
    claim = Claim(
        id=f"claim-{uuid.uuid4().hex[:8]}",
        title=req.title,
        description=req.description,
        category=req.category,
        created_by=req.created_by,
    )
    database.add_claim(claim)
    return claim


@router.delete("/{claim_id}", status_code=204)
def delete_claim(claim_id: str, username: str):
    claim = database.get_claim(claim_id)
    if claim is None:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.created_by is None:
        raise HTTPException(status_code=400, detail="Claim has no owner")
    if claim.created_by != username:
        raise HTTPException(status_code=403, detail="Not allowed to delete this claim")

    positions = database.get_positions_for_claim(claim_id)
    if positions:
        raise HTTPException(status_code=400, detail="Cannot delete a claim with positions")

    database.delete_claim(claim_id)
    return None


@router.post("/{claim_id}/resolve", response_model=Claim)
def resolve(claim_id: str, req: ResolveClaimRequest):
    try:
        return resolve_claim(claim_id, req.resolution)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
