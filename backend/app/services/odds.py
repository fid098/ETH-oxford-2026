from app.models.schemas import Position


def calculate_odds(positions: list[Position]) -> tuple[float, float]:
    """Calculate yes/no percentages from positions. Returns (yes%, no%)."""
    if not positions:
        return 50.0, 50.0

    yes_weight = sum(p.stake * p.confidence for p in positions if p.side == "yes")
    no_weight = sum(p.stake * p.confidence for p in positions if p.side == "no")
    total = yes_weight + no_weight

    if total == 0:
        return 50.0, 50.0

    return round(yes_weight / total * 100, 1), round(no_weight / total * 100, 1)
