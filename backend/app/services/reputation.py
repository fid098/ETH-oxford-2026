from app.models.schemas import Position, Claim


def calculate_accuracy(positions: list[Position], claims: list[Claim]) -> float | None:
    """Calculate a user's prediction accuracy across resolved claims."""
    claim_map = {c.id: c for c in claims}
    correct = 0
    total = 0

    for pos in positions:
        claim = claim_map.get(pos.claim_id)
        if claim is None or claim.status == "active":
            continue
        total += 1
        resolved_yes = claim.status == "resolved_yes"
        if (pos.side == "yes" and resolved_yes) or (pos.side == "no" and not resolved_yes):
            correct += 1

    return round(correct / total * 100, 1) if total > 0 else None


def calculate_category_stats(
    positions: list[Position], claims: list[Claim]
) -> dict[str, dict]:
    """Break down accuracy by category."""
    claim_map = {c.id: c for c in claims}
    stats: dict[str, dict] = {}

    for pos in positions:
        claim = claim_map.get(pos.claim_id)
        if claim is None or claim.status == "active":
            continue

        cat = claim.category
        if cat not in stats:
            stats[cat] = {"correct": 0, "total": 0}

        stats[cat]["total"] += 1
        resolved_yes = claim.status == "resolved_yes"
        if (pos.side == "yes" and resolved_yes) or (pos.side == "no" and not resolved_yes):
            stats[cat]["correct"] += 1

    for cat in stats:
        t = stats[cat]["total"]
        c = stats[cat]["correct"]
        stats[cat]["accuracy"] = round(c / t * 100, 1) if t > 0 else 0

    return stats
