"""Direct data endpoints — no LLM, just DB queries."""

from fastapi import APIRouter, HTTPException

from backend.db.pool import get_pool

router = APIRouter(prefix="/api", tags=["data"])


@router.get("/team/{abbreviation}/cap-sheet")
async def team_cap_sheet(abbreviation: str):
    """Get a team's cap sheet directly from the database."""
    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT p.first_name, p.last_name, p.position,
               c.season, c.cap_hit, c.base_salary, c.total_cash
        FROM contracts c
        JOIN players p ON p.id = c.player_id
        JOIN teams t ON t.id = p.team_id
        WHERE t.abbreviation ILIKE $1
          AND c.season = 2025
        ORDER BY c.cap_hit DESC NULLS LAST
        """,
        abbreviation,
    )
    if not rows:
        raise HTTPException(status_code=404, detail=f"No cap sheet found for {abbreviation}")

    total_salary = sum(r["cap_hit"] or 0 for r in rows)
    return {
        "team": abbreviation.upper(),
        "total_salary": total_salary,
        "player_count": len(rows),
        "contracts": [
            {
                "player": f"{r['first_name']} {r['last_name']}",
                "position": r["position"],
                "season": r["season"],
                "cap_hit": r["cap_hit"],
                "base_salary": r["base_salary"],
                "total_cash": r["total_cash"],
            }
            for r in rows
        ],
    }


@router.get("/player/{name}/profile")
async def player_profile(name: str):
    """Get player info, stats, and contract."""
    pool = await get_pool()

    # Player info
    player_rows = await pool.fetch(
        """
        SELECT p.id, p.first_name, p.last_name, p.position,
               p.height, p.weight, p.draft_year, p.draft_round,
               p.draft_number, p.country, p.jersey_number,
               t.abbreviation AS team, t.city, t.name AS team_name
        FROM players p
        LEFT JOIN teams t ON t.id = p.team_id
        WHERE (p.first_name || ' ' || p.last_name) ILIKE $1
        """,
        f"%{name}%",
    )
    if not player_rows:
        raise HTTPException(status_code=404, detail=f"No player found matching '{name}'")

    p = player_rows[0]
    player_id = p["id"]

    # Season stats
    stat_rows = await pool.fetch(
        """
        SELECT season, stats FROM season_averages
        WHERE player_id = $1
        ORDER BY season DESC
        """,
        player_id,
    )

    # Contract
    contract_rows = await pool.fetch(
        """
        SELECT season, cap_hit, base_salary, total_cash
        FROM contracts
        WHERE player_id = $1
        ORDER BY season DESC
        """,
        player_id,
    )

    return {
        "player": {
            "name": f"{p['first_name']} {p['last_name']}",
            "team": f"{p['city']} {p['team_name']}" if p["team"] else "Free Agent",
            "team_abbreviation": p["team"],
            "position": p["position"],
            "height": p["height"],
            "weight": p["weight"],
            "draft_year": p["draft_year"],
            "draft_round": p["draft_round"],
            "draft_number": p["draft_number"],
            "country": p["country"],
            "jersey_number": p["jersey_number"],
        },
        "stats": [
            {"season": r["season"], "stats": r["stats"]}
            for r in stat_rows
        ],
        "contracts": [
            {
                "season": r["season"],
                "cap_hit": r["cap_hit"],
                "base_salary": r["base_salary"],
                "total_cash": r["total_cash"],
            }
            for r in contract_rows
        ],
    }


@router.get("/team/{abbreviation}/roster")
async def team_roster(abbreviation: str):
    """Get a team's roster."""
    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT DISTINCT p.first_name, p.last_name, p.position, p.draft_year,
               p.height, p.weight, p.country, p.jersey_number,
               t.city, t.name AS team_name, t.abbreviation
        FROM players p
        JOIN teams t ON t.id = p.team_id
        JOIN contracts c ON c.player_id = p.id AND c.season = 2025
        WHERE t.abbreviation ILIKE $1
        ORDER BY p.last_name
        """,
        abbreviation,
    )
    if not rows:
        raise HTTPException(status_code=404, detail=f"No roster found for {abbreviation}")

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
                "jersey_number": r["jersey_number"],
            }
            for r in rows
        ],
    }
