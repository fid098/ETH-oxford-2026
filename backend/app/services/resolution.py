from datetime import datetime
from app.models.schemas import Claim, Position
from app.services import database


def resolve_claim(claim_id: str, resolution: str) -> Claim:
    """Resolve a claim and redistribute points to winners."""
    claim = database.get_claim(claim_id)
    if claim is None:
        raise ValueError(f"Claim {claim_id} not found")
    if claim.status != "active":
        raise ValueError(f"Claim {claim_id} is already resolved")

    positions = database.get_positions_for_claim(claim_id)
    resolved_yes = resolution == "yes"

    # Separate winners and losers
    winners = [p for p in positions if (p.side == "yes") == resolved_yes]
    losers = [p for p in positions if (p.side == "yes") != resolved_yes]

    # Total pool from losers goes to winners proportionally
    loser_pool = sum(p.stake for p in losers)
    winner_total_stake = sum(p.stake for p in winners)

    for w in winners:
        user = database.get_user(w.username)
        if user is None:
            continue
        share = (w.stake / winner_total_stake) * loser_pool if winner_total_stake > 0 else 0
        updated = user.model_copy(update={"points": user.points + share})
        database.update_user(updated)

    # Update claim status
    new_status = "resolved_yes" if resolved_yes else "resolved_no"
    updated_claim = claim.model_copy(
        update={"status": new_status, "resolved_at": datetime.utcnow()}
    )
    database.update_claim(updated_claim)
    return updated_claim
