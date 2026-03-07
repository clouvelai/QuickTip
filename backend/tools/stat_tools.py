from backend.db.pool import get_pool


async def get_player_season_stats(player_name: str, season: int = 2025) -> dict:
    """Get a player's season averages for a given season."""
    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT p.first_name, p.last_name, sa.season, sa.stats,
               t.abbreviation AS team
        FROM season_averages sa
        JOIN players p ON p.id = sa.player_id
        LEFT JOIN teams t ON t.id = p.team_id
        WHERE (p.first_name || ' ' || p.last_name) ILIKE $1
          AND sa.season = $2
        """,
        f"%{player_name}%",
        season,
    )
    if not rows:
        return {"error": f"No stats found for '{player_name}' in {season}"}
    r = rows[0]
    return {
        "player": f"{r['first_name']} {r['last_name']}",
        "team": r["team"],
        "season": r["season"],
        "stats": r["stats"],
    }


async def get_player_career_stats(player_name: str) -> dict:
    """Get all season averages for a player across their career."""
    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT p.first_name, p.last_name, sa.season, sa.stats,
               t.abbreviation AS team
        FROM season_averages sa
        JOIN players p ON p.id = sa.player_id
        LEFT JOIN teams t ON t.id = p.team_id
        WHERE (p.first_name || ' ' || p.last_name) ILIKE $1
        ORDER BY sa.season DESC
        """,
        f"%{player_name}%",
    )
    if not rows:
        return {"error": f"No career stats found for '{player_name}'"}
    return {
        "player": f"{rows[0]['first_name']} {rows[0]['last_name']}",
        "team": rows[0]["team"],
        "seasons": [
            {"season": r["season"], "stats": r["stats"]}
            for r in rows
        ],
    }


async def get_stat_leaders(stat: str, season: int = 2025, limit: int = 10) -> dict:
    """Get league leaders for a given stat from the leaders table."""
    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT p.first_name, p.last_name, t.abbreviation AS team,
               l.stat_type, l.value, l.rank
        FROM leaders l
        JOIN players p ON p.id = l.player_id
        LEFT JOIN teams t ON t.id = p.team_id
        WHERE l.stat_type ILIKE $1
          AND l.season = $2
        ORDER BY l.rank ASC
        LIMIT $3
        """,
        stat,
        season,
        limit,
    )
    if not rows:
        return {"error": f"No leaders found for '{stat}' in {season}"}
    return {
        "stat": stat,
        "season": season,
        "leaders": [
            {
                "rank": r["rank"],
                "player": f"{r['first_name']} {r['last_name']}",
                "team": r["team"],
                "value": r["value"],
            }
            for r in rows
        ],
    }
