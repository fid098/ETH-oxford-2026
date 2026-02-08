import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    Claim,
    ClaimWithOdds,
    CreateClaimRequest,
    ResolveClaimRequest,
)
from app.services import database, odds, oracle
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
    oracle_config = req.oracle_config
    resolution_type = req.resolution_type

    if resolution_type == "manual":
        oracle_config = None

    if resolution_type == "oracle":
        if not req.resolution_date:
            raise HTTPException(status_code=400, detail="Missing resolution date")
        if req.resolution_date <= datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Resolution date must be in the future")
        if not isinstance(oracle_config, dict):
            raise HTTPException(status_code=400, detail="Missing oracle config")
        oracle_type = oracle_config.get("type")
        feed = oracle_config.get("feed")
        comparator = oracle_config.get("comparator")
        target = oracle_config.get("target")
        if oracle_type != "chainlink_price":
            raise HTTPException(status_code=400, detail="Unsupported oracle type")
        if not feed or not comparator or target is None:
            raise HTTPException(status_code=400, detail="Incomplete oracle config")
        if feed not in oracle.CHAINLINK_FEEDS:
            raise HTTPException(status_code=400, detail=f"Unsupported oracle feed: {feed}")
        if comparator not in [">", ">=", "<", "<="]:
            raise HTTPException(status_code=400, detail="Invalid comparator")
        try:
            target = float(target)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=f"Invalid target: {exc}")
        oracle_config = {
            "type": oracle_type,
            "feed": feed,
            "comparator": comparator,
            "target": target,
        }
    claim = Claim(
        id=f"claim-{uuid.uuid4().hex[:8]}",
        title=req.title,
        description=req.description,
        category=req.category,
        created_by=req.created_by,
        resolution_type=resolution_type,
        resolution_date=req.resolution_date,
        oracle_config=oracle_config,
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
    claim = database.get_claim(claim_id)
    if claim is None:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.created_by is None or claim.created_by != req.username:
        raise HTTPException(status_code=403, detail="Only the claim creator can resolve it")
    try:
        return resolve_claim(claim_id, req.resolution)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


def _normalize_resolution_date(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)


@router.get("/{claim_id}/oracle-status")
def oracle_status(claim_id: str):
    claim = database.get_claim(claim_id)
    if claim is None:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.resolution_type != "oracle" or not claim.oracle_config:
        raise HTTPException(status_code=400, detail="Claim is not oracle-resolved")

    feed = claim.oracle_config.get("feed")
    comparator = claim.oracle_config.get("comparator")
    target = claim.oracle_config.get("target")
    try:
        result = oracle.get_chainlink_price(feed)
    except (ConnectionError, ValueError) as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    would_resolve = oracle.evaluate_condition(result.value, comparator, float(target))
    resolution_date = _normalize_resolution_date(claim.resolution_date)

    return {
        "feed": feed,
        "comparator": comparator,
        "target": target,
        "current_value": result.value,
        "updated_at": result.updated_at,
        "would_resolve": would_resolve,
        "resolution_date": resolution_date.isoformat() if resolution_date else None,
        "network": "Ethereum Mainnet",
        "rpc": oracle.get_provider_label(),
    }


@router.post("/{claim_id}/check-oracle")
def check_oracle(claim_id: str):
    claim = database.get_claim(claim_id)
    if claim is None:
        raise HTTPException(status_code=404, detail="Claim not found")
    if claim.status != "active":
        raise HTTPException(status_code=400, detail="Claim already resolved")
    if claim.resolution_type != "oracle" or not claim.oracle_config:
        raise HTTPException(status_code=400, detail="Claim is not oracle-resolved")

    feed = claim.oracle_config.get("feed")
    comparator = claim.oracle_config.get("comparator")
    target = claim.oracle_config.get("target")
    try:
        result = oracle.get_chainlink_price(feed)
    except (ConnectionError, ValueError) as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    would_resolve = oracle.evaluate_condition(result.value, comparator, float(target))
    resolution_date = _normalize_resolution_date(claim.resolution_date)

    if resolution_date and datetime.now(timezone.utc).replace(tzinfo=None) < resolution_date:
        return {
            "resolved": False,
            "would_resolve": would_resolve,
            "current_value": result.value,
            "resolution_date": resolution_date.isoformat(),
        }

    resolved_claim = resolve_claim(claim_id, "yes" if would_resolve else "no")
    return {
        "resolved": True,
        "resolution": "yes" if would_resolve else "no",
        "claim": resolved_claim,
        "current_value": result.value,
    }
