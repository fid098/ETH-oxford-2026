from fastapi import APIRouter, HTTPException
from app.models.schemas import UserProfile
from app.services import database
from app.services.reputation import calculate_accuracy, calculate_category_stats

router = APIRouter()


@router.get("/", response_model=list[UserProfile])
def list_users():
    users = database.get_all_users()
    claims = database.get_all_claims()
    claim_map = {c.id: c for c in claims}
    result = []
    for user in users:
        positions = database.get_positions_for_user(user.username)
        active = [p for p in positions if claim_map.get(p.claim_id) and claim_map[p.claim_id].status == "active"]
        resolved = [p for p in positions if p not in active]
        result.append(
            UserProfile(
                username=user.username,
                display_name=user.display_name,
                wallet_address=user.wallet_address,
                points=user.points,
                accuracy=calculate_accuracy(positions, claims),
                total_resolved=len(resolved),
                active_positions=active,
                resolved_positions=resolved,
            )
        )
    return result


@router.get("/{username}", response_model=UserProfile)
def get_user(username: str):
    user = database.get_user(username)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    claims = database.get_all_claims()
    claim_map = {c.id: c for c in claims}
    positions = database.get_positions_for_user(username)
    active = [p for p in positions if claim_map.get(p.claim_id) and claim_map[p.claim_id].status == "active"]
    resolved = [p for p in positions if p not in active]

    return UserProfile(
        username=user.username,
        display_name=user.display_name,
        wallet_address=user.wallet_address,
        points=user.points,
        accuracy=calculate_accuracy(positions, claims),
        total_resolved=len(resolved),
        category_stats=calculate_category_stats(positions, claims),
        active_positions=active,
        resolved_positions=resolved,
    )
