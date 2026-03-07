"""Trade analysis tool — uses contract and CBA tools internally."""

from backend.tools.contract_tools import get_player_contract, get_team_cap_sheet
from backend.tools.cba_tools import check_trade_salary_match, get_cap_info, CAP_THRESHOLDS


def _total_salary(contracts_list: list[dict]) -> int:
    """Sum cap_hit from the most recent contract for each player."""
    return sum(
        (c["contracts"][0].get("cap_hit") or 0)
        for c in contracts_list
        if c.get("contracts")
    )


async def _fetch_contracts(player_names: list[str]) -> tuple[list[dict], list[str]]:
    """Fetch contracts for a list of players, returning (contracts, errors)."""
    contracts = []
    errors = []
    for name in player_names:
        contract = await get_player_contract(name)
        if "error" in contract:
            errors.append(contract["error"])
        else:
            contracts.append(contract)
    return contracts, errors


async def analyze_trade(team1_players: list[str], team2_players: list[str]) -> dict:
    """
    Analyze a proposed trade between two teams.

    team1_players: list of player names team 1 is sending out
    team2_players: list of player names team 2 is sending out
    """
    cap_info = await get_cap_info()

    team1_contracts, team1_errors = await _fetch_contracts(team1_players)
    team2_contracts, team2_errors = await _fetch_contracts(team2_players)

    if team1_errors or team2_errors:
        return {
            "error": "Could not find contracts for some players",
            "missing": team1_errors + team2_errors,
        }

    team1_outgoing = _total_salary(team1_contracts)
    team2_outgoing = _total_salary(team2_contracts)

    # Determine teams
    team1_name = team1_contracts[0].get("team", "Team 1") if team1_contracts else "Team 1"
    team2_name = team2_contracts[0].get("team", "Team 2") if team2_contracts else "Team 2"

    # Get cap sheets to determine if teams are over the cap
    team1_cap = None
    team2_cap = None
    if team1_name and team1_name != "Team 1":
        team1_cap = await get_team_cap_sheet(team1_name)
    if team2_name and team2_name != "Team 2":
        team2_cap = await get_team_cap_sheet(team2_name)

    salary_cap = CAP_THRESHOLDS["salary_cap"]
    team1_over_cap = (team1_cap and team1_cap.get("total_salary", 0) > salary_cap) if team1_cap else True
    team2_over_cap = (team2_cap and team2_cap.get("total_salary", 0) > salary_cap) if team2_cap else True

    # Check salary matching for both sides
    # Team 1 receives team2_players (incoming = team2_outgoing)
    team1_check = await check_trade_salary_match(team1_outgoing, team2_outgoing, team1_over_cap)
    # Team 2 receives team1_players (incoming = team1_outgoing)
    team2_check = await check_trade_salary_match(team2_outgoing, team1_outgoing, team2_over_cap)

    trade_valid = team1_check["valid"] and team2_check["valid"]

    return {
        "trade_valid": trade_valid,
        "team1": {
            "team": team1_name,
            "sending": [
                {
                    "player": c.get("player"),
                    "cap_hit": c["contracts"][0].get("cap_hit") if c.get("contracts") else None,
                }
                for c in team1_contracts
            ],
            "total_outgoing_salary": team1_outgoing,
            "total_team_salary": team1_cap.get("total_salary") if team1_cap else None,
            "over_cap": team1_over_cap,
            "salary_match_check": team1_check,
        },
        "team2": {
            "team": team2_name,
            "sending": [
                {
                    "player": c.get("player"),
                    "cap_hit": c["contracts"][0].get("cap_hit") if c.get("contracts") else None,
                }
                for c in team2_contracts
            ],
            "total_outgoing_salary": team2_outgoing,
            "total_team_salary": team2_cap.get("total_salary") if team2_cap else None,
            "over_cap": team2_over_cap,
            "salary_match_check": team2_check,
        },
        "salary_difference": abs(team1_outgoing - team2_outgoing),
        "cap_info": cap_info,
    }
