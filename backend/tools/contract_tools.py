from backend.db.pool import get_pool


async def get_player_contract(player_name: str) -> dict:
    """Get contract details for a player by name."""
    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT p.first_name, p.last_name, c.season, c.cap_hit, c.base_salary,
               c.total_cash, t.abbreviation AS team
        FROM contracts c
        JOIN players p ON p.id = c.player_id
        LEFT JOIN teams t ON t.id = p.team_id
        WHERE (p.first_name || ' ' || p.last_name) ILIKE $1
        ORDER BY c.season DESC
        """,
        f"%{player_name}%",
    )
    if not rows:
        return {"error": f"No contract found for '{player_name}'"}
    return {
        "player": f"{rows[0]['first_name']} {rows[0]['last_name']}",
        "team": rows[0]["team"],
        "contracts": [dict(r) for r in rows],
    }


async def get_team_cap_sheet(team_abbreviation: str) -> dict:
    """Get all contracts for a team and total salary."""
    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT p.first_name, p.last_name, p.position, c.season,
               c.cap_hit, c.base_salary, c.total_cash
        FROM contracts c
        JOIN players p ON p.id = c.player_id
        JOIN teams t ON t.id = p.team_id
        WHERE t.abbreviation ILIKE $1
          AND c.season = 2025
        ORDER BY c.cap_hit DESC NULLS LAST
        """,
        team_abbreviation,
    )
    if not rows:
        return {"error": f"No contracts found for team '{team_abbreviation}'"}

    total_salary = sum(r["cap_hit"] or 0 for r in rows)
    return {
        "team": team_abbreviation.upper(),
        "total_salary": total_salary,
        "player_count": len(rows),
        "contracts": [
            {
                "player": f"{r['first_name']} {r['last_name']}",
                "position": r["position"],
                "season": r["season"],
                "cap_hit": r["cap_hit"],
                "base_salary": r["base_salary"],
            }
            for r in rows
        ],
    }


async def get_free_agents(position: str = None) -> dict:
    """Get players without active contracts, optionally filtered by position."""
    pool = await get_pool()
    base_query = """
        SELECT p.first_name, p.last_name, p.position, t.abbreviation AS team
        FROM players p
        LEFT JOIN teams t ON t.id = p.team_id
        WHERE p.id NOT IN (SELECT player_id FROM contracts)
    """
    if position:
        rows = await pool.fetch(
            base_query + "AND p.position ILIKE $1 ORDER BY p.last_name LIMIT 50",
            f"%{position}%",
        )
    else:
        rows = await pool.fetch(
            base_query + "ORDER BY p.last_name LIMIT 50"
        )
    return {
        "count": len(rows),
        "free_agents": [
            {
                "player": f"{r['first_name']} {r['last_name']}",
                "position": r["position"],
                "last_team": r["team"],
            }
            for r in rows
        ],
    }
