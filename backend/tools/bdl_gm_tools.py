"""BDL Trade Machine tools — calls gm-api.balldontlie.io + local DB for roster data."""

import asyncio
import base64
import json
import time

import httpx

from backend.db.pool import get_pool
from backend.tools.cba_tools import CAP_THRESHOLDS

BDL_GM_BASE = "https://gm-api.balldontlie.io/gm/v1"
_http_client: httpx.AsyncClient | None = None

# ---------- caches (module-level, TTL-based) ----------

_teams_cache: dict | None = None  # {abbr: {id, abbreviation, full_name, ...}}
_teams_cache_ts: float = 0

_roster_cache: dict[str, tuple[list[dict], float]] = {}  # abbr -> (roster, timestamp)

CACHE_TTL = 300  # 5 minutes


def _client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(base_url=BDL_GM_BASE, timeout=15)
    return _http_client


# ---------- internal helpers ----------

async def _ensure_teams() -> dict[str, dict]:
    """Fetch and cache BDL teams list.  Returns {abbreviation: team_dict}."""
    global _teams_cache, _teams_cache_ts
    if _teams_cache and (time.time() - _teams_cache_ts < CACHE_TTL):
        return _teams_cache
    resp = await _client().get("/teams")
    resp.raise_for_status()
    teams = resp.json()["data"]
    _teams_cache = {t["abbreviation"]: t for t in teams}
    _teams_cache_ts = time.time()
    return _teams_cache


async def _bdl_team_id(abbreviation: str) -> int:
    """Resolve a team abbreviation to its BDL team id."""
    teams = await _ensure_teams()
    team = teams.get(abbreviation.upper())
    if not team:
        raise ValueError(f"Unknown team abbreviation: {abbreviation}")
    return team["id"]


async def _local_roster_with_contracts(team_abbreviation: str) -> list[dict]:
    """Get roster + contract data from local DB, with caching."""
    abbr = team_abbreviation.upper()
    cached = _roster_cache.get(abbr)
    if cached and (time.time() - cached[1] < CACHE_TTL):
        return cached[0]

    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT p.id AS player_id, p.first_name, p.last_name, p.position,
               c.cap_hit, c.base_salary, c.total_cash, c.season,
               t.abbreviation AS team
        FROM contracts c
        JOIN players p ON p.id = c.player_id
        JOIN teams t ON t.id = p.team_id
        WHERE t.abbreviation ILIKE $1
          AND c.season = 2025
        ORDER BY c.cap_hit DESC NULLS LAST
        """,
        abbr,
    )
    roster = [
        {
            "player_id": r["player_id"],
            "player": f"{r['first_name']} {r['last_name']}",
            "first_name": r["first_name"],
            "last_name": r["last_name"],
            "position": r["position"],
            "cap_hit": r["cap_hit"] or 0,
            "base_salary": r["base_salary"] or 0,
            "season": r["season"],
            "team": r["team"],
        }
        for r in rows
    ]
    _roster_cache[abbr] = (roster, time.time())
    return roster


async def _resolve_player_name(name: str, team_abbr: str | None = None) -> dict | None:
    """Find a player by name from local DB roster data.  Returns player dict or None."""
    name_lower = name.lower().strip()

    # If team is specified, search just that roster
    if team_abbr:
        roster = await _local_roster_with_contracts(team_abbr)
        for p in roster:
            if name_lower in p["player"].lower():
                return p
        return None

    # Otherwise search all teams
    pool = await get_pool()
    rows = await pool.fetch(
        """
        SELECT p.id AS player_id, p.first_name, p.last_name, p.position,
               c.cap_hit, c.base_salary, c.total_cash, c.season,
               t.abbreviation AS team
        FROM contracts c
        JOIN players p ON p.id = c.player_id
        JOIN teams t ON t.id = p.team_id
        WHERE (p.first_name || ' ' || p.last_name) ILIKE $1
          AND c.season = 2025
        ORDER BY c.cap_hit DESC
        LIMIT 1
        """,
        f"%{name}%",
    )
    if not rows:
        return None
    r = rows[0]
    return {
        "player_id": r["player_id"],
        "player": f"{r['first_name']} {r['last_name']}",
        "first_name": r["first_name"],
        "last_name": r["last_name"],
        "position": r["position"],
        "cap_hit": r["cap_hit"] or 0,
        "base_salary": r["base_salary"] or 0,
        "season": r["season"],
        "team": r["team"],
    }


async def _resolve_player_bdl_id(player_name: str, team_bdl_id: int) -> int | None:
    """Resolve a player name to a BDL roster player ID via the GM API roster endpoint."""
    try:
        resp = await _client().get(f"/teams/{team_bdl_id}/roster")
        resp.raise_for_status()
        roster = resp.json()["data"]
        name_lower = player_name.lower()
        for p in roster:
            full = f"{p.get('first_name', '')} {p.get('last_name', '')}".lower()
            if name_lower in full or full in name_lower:
                return p["id"]
    except Exception:
        pass
    return None


# ---------- public tool functions ----------

async def bdl_get_teams() -> dict:
    """Get all NBA teams from the BDL Trade Machine API."""
    teams = await _ensure_teams()
    return {
        "count": len(teams),
        "teams": [
            {
                "abbreviation": t["abbreviation"],
                "full_name": t["full_name"],
                "conference": t["conference"],
                "division": t["division"],
            }
            for t in teams.values()
        ],
    }


async def bdl_get_team_roster(team_abbreviation: str, season: int = 2025) -> dict:
    """Get team roster with contract details."""
    abbr = team_abbreviation.upper()
    roster = await _local_roster_with_contracts(abbr)
    if not roster:
        return {"error": f"No roster found for team '{abbr}'"}
    total_salary = sum(p["cap_hit"] for p in roster)
    return {
        "team": abbr,
        "player_count": len(roster),
        "total_salary": total_salary,
        "roster": [
            {
                "player": p["player"],
                "position": p["position"],
                "cap_hit": p["cap_hit"],
                "base_salary": p["base_salary"],
            }
            for p in roster
        ],
    }


async def bdl_get_team_cap(team_abbreviation: str, season: int = 2025) -> dict:
    """Get team cap info from the BDL GM API."""
    abbr = team_abbreviation.upper()
    try:
        team_id = await _bdl_team_id(abbr)
        params = {"season": season} if season else {}
        resp = await _client().get(f"/teams/{team_id}/cap", params=params)
        resp.raise_for_status()
        cap = resp.json()["data"]
        return {
            "team": abbr,
            "team_name": cap["team"]["full_name"],
            "season": cap["season"],
            "total_cap_commitments": cap["total_cap_commitments"],
            "active_salary_total": cap["active_salary_total"],
            "dead_money": cap["dead_money"],
            "cap_holds_total": cap.get("cap_holds_total", 0),
            "cap_space": cap["cap_space"],
            "first_apron_space": cap["first_apron_space"],
            "second_apron_space": cap["second_apron_space"],
            "cap_holds": cap.get("cap_holds", []),
        }
    except httpx.HTTPStatusError as e:
        return {"error": f"BDL API error: {e.response.status_code}"}
    except Exception as e:
        return {"error": f"Failed to fetch cap info: {str(e)}"}


async def bdl_validate_trade(teams: list[dict], season: int = 2025) -> dict:
    """
    Validate a trade via the BDL GM API.

    teams: list of {team_abbr: str, sending_player_names: [str], receiving_player_names: [str]}
    """
    try:
        # Build the BDL API request body
        bdl_teams = []
        for team_spec in teams:
            abbr = team_spec["team_abbr"].upper()
            team_id = await _bdl_team_id(abbr)

            # Resolve player names to BDL IDs
            sending_ids = []
            for name in team_spec.get("sending_player_names", []):
                pid = await _resolve_player_bdl_id(name, team_id)
                if pid:
                    sending_ids.append(pid)

            receiving_ids = []
            for name in team_spec.get("receiving_player_names", []):
                # receiving players come from other teams, need to find their BDL team
                player = await _resolve_player_name(name)
                if player:
                    other_team_id = await _bdl_team_id(player["team"])
                    pid = await _resolve_player_bdl_id(name, other_team_id)
                    if pid:
                        receiving_ids.append(pid)

            bdl_teams.append({
                "teamId": team_id,
                "sendingPlayerIds": sending_ids,
                "receivingPlayerIds": receiving_ids,
                "sendingCash": team_spec.get("sending_cash"),
            })

        body = {"teams": bdl_teams, "season": season}
        resp = await _client().post("/trades/validate", json=body)
        resp.raise_for_status()
        result = resp.json()["data"]
        return {"valid": True, "validation": result, "request": body}
    except httpx.HTTPStatusError as e:
        # The API may return validation errors as 4xx
        try:
            err_body = e.response.json()
            return {"valid": False, "error": err_body, "status": e.response.status_code}
        except Exception:
            return {"valid": False, "error": str(e)}
    except Exception as e:
        return {"error": f"Trade validation failed: {str(e)}"}


async def bdl_build_trade_url(teams: list[dict], season: int = 2025) -> dict:
    """
    Build a trade.balldontlie.io URL that loads a proposed trade.

    teams: list of {team_abbr: str, sending_player_names: [str]}
    Returns a URL the user can click to open the trade in the BDL Trade Machine.
    """
    try:
        columns = []
        all_sending = {}  # player_name -> dest_team_bdl_id

        # First pass: resolve all teams and collect sending players
        team_infos = []
        for team_spec in teams:
            abbr = team_spec["team_abbr"].upper()
            team_id = await _bdl_team_id(abbr)
            roster = await _local_roster_with_contracts(abbr)

            sending_player_ids = []
            sending_details = []
            for name in team_spec.get("sending_player_names", []):
                name_lower = name.lower()
                for p in roster:
                    if name_lower in p["player"].lower():
                        sending_player_ids.append(p["player_id"])
                        sending_details.append({
                            "name": p["player"],
                            "cap_hit": p["cap_hit"],
                        })
                        all_sending[p["player"]] = None  # will fill dest later
                        break

            team_infos.append({
                "abbr": abbr,
                "bdl_team_id": team_id,
                "sending_player_ids": sending_player_ids,
                "sending_details": sending_details,
            })

        # Second pass: determine destinations (for 2-team trade, each team's
        # outgoing players go to the other team)
        player_destinations = {}
        if len(team_infos) == 2:
            for pid in team_infos[0]["sending_player_ids"]:
                player_destinations[pid] = team_infos[1]["bdl_team_id"]
            for pid in team_infos[1]["sending_player_ids"]:
                player_destinations[pid] = team_infos[0]["bdl_team_id"]

        # Try to resolve to BDL player IDs for the URL
        for info in team_infos:
            bdl_sending = []
            bdl_destinations = {}
            try:
                resp = await _client().get(f"/teams/{info['bdl_team_id']}/roster")
                resp.raise_for_status()
                bdl_roster = resp.json()["data"]

                for detail in info["sending_details"]:
                    name_lower = detail["name"].lower()
                    for bp in bdl_roster:
                        bdl_name = f"{bp.get('first_name', '')} {bp.get('last_name', '')}".lower()
                        if name_lower in bdl_name or bdl_name in name_lower:
                            bdl_sending.append(bp["id"])
                            # Set destination
                            if len(team_infos) == 2:
                                other = [t for t in team_infos if t["bdl_team_id"] != info["bdl_team_id"]][0]
                                bdl_destinations[str(bp["id"])] = other["bdl_team_id"]
                            break
            except Exception:
                # BDL roster endpoint may be down — fall back to local player IDs
                # (the trade machine may not load these correctly, but we provide the URL anyway)
                bdl_sending = info["sending_player_ids"]
                for pid in bdl_sending:
                    if pid in player_destinations:
                        bdl_destinations[str(pid)] = player_destinations[pid]

            columns.append({
                "t": info["bdl_team_id"],
                "p": bdl_sending,
                "d": bdl_destinations,
                "c": 0,
                "pk": [],
            })

        state = {"columns": columns, "s": season}
        encoded = base64.b64encode(json.dumps(state).encode()).decode()
        url = f"https://trade.balldontlie.io/#{encoded}"

        # Build a human-readable summary
        summary_parts = []
        for info in team_infos:
            players = ", ".join(d["name"] for d in info["sending_details"])
            summary_parts.append(f"{info['abbr']} sends: {players}")

        return {
            "url": url,
            "summary": " | ".join(summary_parts),
            "teams": [
                {
                    "team": info["abbr"],
                    "sending": info["sending_details"],
                }
                for info in team_infos
            ],
        }
    except Exception as e:
        return {"error": f"Failed to build trade URL: {str(e)}"}


async def bdl_find_salary_matches(
    player_name: str,
    target_team_abbr: str | None = None,
    max_players_in_package: int = 3,
) -> dict:
    """
    Find salary-matching trade packages for a player.

    Scans team rosters to find combinations of 1-3 players whose combined salary
    falls within CBA salary-matching range of the target player's salary.
    """
    # Find the target player
    target = await _resolve_player_name(player_name)
    if not target:
        return {"error": f"Player not found: {player_name}"}

    target_salary = target["cap_hit"]
    target_team = target["team"]
    salary_cap = CAP_THRESHOLDS["salary_cap"]

    # Determine which teams to scan
    if target_team_abbr:
        scan_teams = [target_team_abbr.upper()]
    else:
        teams = await _ensure_teams()
        scan_teams = [abbr for abbr in teams if abbr != target_team]

    # Fetch all rosters in parallel
    roster_tasks = [_local_roster_with_contracts(abbr) for abbr in scan_teams]
    rosters = await asyncio.gather(*roster_tasks, return_exceptions=True)

    # For each team, find salary-matching combos
    matches = []
    for abbr, roster in zip(scan_teams, rosters):
        if isinstance(roster, Exception) or not roster:
            continue

        team_total_salary = sum(p["cap_hit"] for p in roster)
        team_over_cap = team_total_salary > salary_cap

        # Calculate matching thresholds (what the OTHER team can take back)
        # The acquiring team sends these players and receives the target
        if not team_over_cap:
            # Under cap team can absorb up to cap space + outgoing
            cap_room = salary_cap - team_total_salary
            min_outgoing = max(0, target_salary - cap_room)
            max_outgoing = float("inf")  # no upper limit for under-cap teams
        else:
            # Over cap: target_salary must be <= outgoing * 1.25 + 100K
            # So outgoing >= (target_salary - 100K) / 1.25
            min_outgoing = max(0, (target_salary - 100_000) / 1.25)
            max_outgoing = target_salary * 1.25 + 100_000  # what they can receive back

        # Filter eligible players (can't trade the player to themselves)
        eligible = [p for p in roster if p["cap_hit"] > 0]

        # Find 1-player matches
        for p in eligible:
            if min_outgoing <= p["cap_hit"] <= max_outgoing:
                diff = abs(p["cap_hit"] - target_salary)
                matches.append({
                    "team": abbr,
                    "players": [{"player": p["player"], "position": p["position"], "cap_hit": p["cap_hit"]}],
                    "total_salary": p["cap_hit"],
                    "salary_difference": diff,
                    "team_over_cap": team_over_cap,
                })

        # Find 2-player combos (if max_players >= 2)
        if max_players_in_package >= 2 and len(eligible) >= 2:
            for i in range(len(eligible)):
                for j in range(i + 1, len(eligible)):
                    combined = eligible[i]["cap_hit"] + eligible[j]["cap_hit"]
                    if min_outgoing <= combined <= max_outgoing:
                        diff = abs(combined - target_salary)
                        matches.append({
                            "team": abbr,
                            "players": [
                                {"player": eligible[i]["player"], "position": eligible[i]["position"], "cap_hit": eligible[i]["cap_hit"]},
                                {"player": eligible[j]["player"], "position": eligible[j]["position"], "cap_hit": eligible[j]["cap_hit"]},
                            ],
                            "total_salary": combined,
                            "salary_difference": diff,
                            "team_over_cap": team_over_cap,
                        })

        # Find 3-player combos (if max_players >= 3, limit to avoid combinatorial explosion)
        if max_players_in_package >= 3 and len(eligible) >= 3:
            # Only check top-15 salary players to keep it manageable
            top = eligible[:15]
            for i in range(len(top)):
                for j in range(i + 1, len(top)):
                    for k in range(j + 1, len(top)):
                        combined = top[i]["cap_hit"] + top[j]["cap_hit"] + top[k]["cap_hit"]
                        if min_outgoing <= combined <= max_outgoing:
                            diff = abs(combined - target_salary)
                            matches.append({
                                "team": abbr,
                                "players": [
                                    {"player": top[i]["player"], "position": top[i]["position"], "cap_hit": top[i]["cap_hit"]},
                                    {"player": top[j]["player"], "position": top[j]["position"], "cap_hit": top[j]["cap_hit"]},
                                    {"player": top[k]["player"], "position": top[k]["position"], "cap_hit": top[k]["cap_hit"]},
                                ],
                                "total_salary": combined,
                                "salary_difference": diff,
                                "team_over_cap": team_over_cap,
                            })

    # Sort by salary difference (closest match first) and limit results
    matches.sort(key=lambda m: m["salary_difference"])
    top_matches = matches[:20]

    return {
        "target_player": target["player"],
        "target_team": target_team,
        "target_salary": target_salary,
        "matches_found": len(matches),
        "top_matches": top_matches,
    }
