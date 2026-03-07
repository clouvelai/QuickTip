from backend.db.pool import get_pool


async def get_team_roster(team_abbreviation: str) -> dict:
    """Get the roster for a team by abbreviation."""
    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT DISTINCT p.first_name, p.last_name, p.position, p.draft_year,
               p.height, p.weight, p.country,
               t.abbreviation, t.city, t.name AS team_name
        FROM players p
        JOIN teams t ON t.id = p.team_id
        JOIN contracts c ON c.player_id = p.id AND c.season = 2025
        WHERE t.abbreviation ILIKE $1
        ORDER BY p.last_name
        """,
        team_abbreviation,
    )
    if not rows:
        return {"error": f"No roster found for team '{team_abbreviation}'"}
    return {
        "team": f"{rows[0]['city']} {rows[0]['team_name']}",
        "abbreviation": rows[0]["abbreviation"],
        "player_count": len(rows),
        "roster": [
            {
                "player": f"{r['first_name']} {r['last_name']}",
                "position": r["position"],
                "draft_year": r["draft_year"],
                "height": r["height"],
                "weight": r["weight"],
                "country": r["country"],
            }
            for r in rows
        ],
    }


async def get_player_profile(player_name: str) -> dict:
    """Get full player info including bio details."""
    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT p.id, p.first_name, p.last_name, p.position,
               p.height, p.weight, p.draft_year, p.draft_round,
               p.draft_number, p.country, p.jersey_number,
               t.abbreviation AS team, t.city, t.name AS team_name
        FROM players p
        LEFT JOIN teams t ON t.id = p.team_id
        WHERE (p.first_name || ' ' || p.last_name) ILIKE $1
        """,
        f"%{player_name}%",
    )
    if not rows:
        return {"error": f"No player found matching '{player_name}'"}
    r = rows[0]
    return {
        "player": f"{r['first_name']} {r['last_name']}",
        "team": f"{r['city']} {r['team_name']}" if r["team"] else "Free Agent",
        "team_abbreviation": r["team"],
        "position": r["position"],
        "height": r["height"],
        "weight": r["weight"],
        "draft_year": r["draft_year"],
        "draft_round": r["draft_round"],
        "draft_number": r["draft_number"],
        "country": r["country"],
        "jersey_number": r["jersey_number"],
    }
