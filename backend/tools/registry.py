"""Tool registry — maps tool names to functions, descriptions, and JSON Schema parameters."""

from backend.tools.bdl_gm_tools import (
    bdl_get_teams,
    bdl_get_team_roster,
    bdl_get_team_cap,
    bdl_validate_trade,
    bdl_build_trade_url,
    bdl_find_salary_matches,
)
from backend.tools.stat_tools import get_player_season_stats, get_player_career_stats, get_stat_leaders
from backend.tools.roster_tools import get_player_profile
from backend.tools.cba_tools import get_cap_info, check_trade_salary_match, get_available_exceptions

TOOL_REGISTRY: dict[str, dict] = {
    # --- BDL Trade Machine tools ---
    "bdl_get_teams": {
        "function": bdl_get_teams,
        "description": "Get all NBA teams from the BDL Trade Machine.",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    },
    "bdl_get_team_roster": {
        "function": bdl_get_team_roster,
        "description": "Get team roster with player contracts and salary details.",
        "parameters": {
            "type": "object",
            "properties": {
                "team_abbreviation": {
                    "type": "string",
                    "description": "Team abbreviation (e.g. 'LAL', 'BOS', 'GSW')",
                },
                "season": {
                    "type": "integer",
                    "description": "Season year (default: 2025)",
                },
            },
            "required": ["team_abbreviation"],
        },
    },
    "bdl_get_team_cap": {
        "function": bdl_get_team_cap,
        "description": "Get team cap info from the BDL Trade Machine — cap space, apron room, salary commitments, cap holds.",
        "parameters": {
            "type": "object",
            "properties": {
                "team_abbreviation": {
                    "type": "string",
                    "description": "Team abbreviation (e.g. 'LAL', 'BOS', 'GSW')",
                },
                "season": {
                    "type": "integer",
                    "description": "Season year (default: 2025)",
                },
            },
            "required": ["team_abbreviation"],
        },
    },
    "bdl_validate_trade": {
        "function": bdl_validate_trade,
        "description": "Validate a proposed trade via the BDL Trade Machine API. Checks CBA compliance and salary matching.",
        "parameters": {
            "type": "object",
            "properties": {
                "teams": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "team_abbr": {
                                "type": "string",
                                "description": "Team abbreviation",
                            },
                            "sending_player_names": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Player names this team is sending out",
                            },
                            "receiving_player_names": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Player names this team is receiving",
                            },
                        },
                        "required": ["team_abbr", "sending_player_names"],
                    },
                    "description": "Teams involved in the trade",
                },
                "season": {
                    "type": "integer",
                    "description": "Season year (default: 2025)",
                },
            },
            "required": ["teams"],
        },
    },
    "bdl_build_trade_url": {
        "function": bdl_build_trade_url,
        "description": "Build a trade.balldontlie.io URL that loads a proposed trade in the Trade Machine. Returns a clickable link.",
        "parameters": {
            "type": "object",
            "properties": {
                "teams": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "team_abbr": {
                                "type": "string",
                                "description": "Team abbreviation",
                            },
                            "sending_player_names": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Player names this team is sending out",
                            },
                        },
                        "required": ["team_abbr", "sending_player_names"],
                    },
                    "description": "Teams and the players each is sending",
                },
                "season": {
                    "type": "integer",
                    "description": "Season year (default: 2025)",
                },
            },
            "required": ["teams"],
        },
    },
    "bdl_find_salary_matches": {
        "function": bdl_find_salary_matches,
        "description": "Find salary-matching trade packages for a player across the league. Scans team rosters to find player combinations whose salary matches CBA trade rules.",
        "parameters": {
            "type": "object",
            "properties": {
                "player_name": {
                    "type": "string",
                    "description": "The player to find trade matches for (e.g. 'Klay Thompson')",
                },
                "target_team_abbr": {
                    "type": "string",
                    "description": "Only search this team's roster for matches (optional, searches all teams if omitted)",
                },
                "max_players_in_package": {
                    "type": "integer",
                    "description": "Maximum players in a matching package (1-3, default: 3)",
                },
            },
            "required": ["player_name"],
        },
    },
    # --- Stats tools (local DB) ---
    "get_player_season_stats": {
        "function": get_player_season_stats,
        "description": "Get a player's season averages (points, rebounds, assists, etc.) for a specific season.",
        "parameters": {
            "type": "object",
            "properties": {
                "player_name": {
                    "type": "string",
                    "description": "The player's name",
                },
                "season": {
                    "type": "integer",
                    "description": "The season year (e.g. 2024). Defaults to 2025.",
                },
            },
            "required": ["player_name"],
        },
    },
    "get_player_career_stats": {
        "function": get_player_career_stats,
        "description": "Get all career season averages for an NBA player.",
        "parameters": {
            "type": "object",
            "properties": {
                "player_name": {
                    "type": "string",
                    "description": "The player's name",
                },
            },
            "required": ["player_name"],
        },
    },
    "get_stat_leaders": {
        "function": get_stat_leaders,
        "description": "Get the league leaders for a specific stat (e.g. 'pts', 'reb', 'ast').",
        "parameters": {
            "type": "object",
            "properties": {
                "stat": {
                    "type": "string",
                    "description": "The stat name (e.g. 'pts', 'reb', 'ast', 'stl', 'blk')",
                },
                "season": {
                    "type": "integer",
                    "description": "Season year. Defaults to 2025.",
                },
                "limit": {
                    "type": "integer",
                    "description": "Number of leaders to return. Defaults to 10.",
                },
            },
            "required": ["stat"],
        },
    },
    # --- Player profile (local DB) ---
    "get_player_profile": {
        "function": get_player_profile,
        "description": "Get full profile for an NBA player — bio, draft info, physical measurements.",
        "parameters": {
            "type": "object",
            "properties": {
                "player_name": {
                    "type": "string",
                    "description": "The player's name",
                },
            },
            "required": ["player_name"],
        },
    },
    # --- CBA tools (pure Python) ---
    "get_cap_info": {
        "function": get_cap_info,
        "description": "Get current NBA salary cap thresholds — cap, luxury tax, apron lines, exception values.",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    },
    "check_trade_salary_match": {
        "function": check_trade_salary_match,
        "description": "Check if a trade satisfies CBA salary-matching rules.",
        "parameters": {
            "type": "object",
            "properties": {
                "outgoing_salary": {
                    "type": "number",
                    "description": "Total salary of players being sent out",
                },
                "incoming_salary": {
                    "type": "number",
                    "description": "Total salary of players being received",
                },
                "team_over_cap": {
                    "type": "boolean",
                    "description": "Whether the team is over the salary cap",
                },
            },
            "required": ["outgoing_salary", "incoming_salary", "team_over_cap"],
        },
    },
    "get_available_exceptions": {
        "function": get_available_exceptions,
        "description": "Determine which salary exceptions (MLE, BAE, etc.) a team can use based on their total salary.",
        "parameters": {
            "type": "object",
            "properties": {
                "team_total_salary": {
                    "type": "number",
                    "description": "The team's total current salary",
                },
            },
            "required": ["team_total_salary"],
        },
    },
}


def get_openai_tools_schema() -> list[dict]:
    """Return tool definitions in OpenAI function-calling format."""
    return [
        {
            "type": "function",
            "function": {
                "name": name,
                "description": info["description"],
                "parameters": info["parameters"],
            },
        }
        for name, info in TOOL_REGISTRY.items()
    ]


def get_tool_function(name: str):
    """Look up a tool function by name."""
    entry = TOOL_REGISTRY.get(name)
    return entry["function"] if entry else None
