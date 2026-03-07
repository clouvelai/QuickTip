"""Tool registry — maps tool names to functions, descriptions, and JSON Schema parameters."""

from backend.tools.contract_tools import get_player_contract, get_team_cap_sheet, get_free_agents
from backend.tools.stat_tools import get_player_season_stats, get_player_career_stats, get_stat_leaders
from backend.tools.roster_tools import get_team_roster, get_player_profile
from backend.tools.cba_tools import get_cap_info, check_trade_salary_match, get_available_exceptions
from backend.tools.trade_tools import analyze_trade

TOOL_REGISTRY: dict[str, dict] = {
    "get_player_contract": {
        "function": get_player_contract,
        "description": "Get contract details (cap hit, base salary, seasons) for an NBA player by name.",
        "parameters": {
            "type": "object",
            "properties": {
                "player_name": {
                    "type": "string",
                    "description": "The player's name (e.g. 'LeBron James')",
                },
            },
            "required": ["player_name"],
        },
    },
    "get_team_cap_sheet": {
        "function": get_team_cap_sheet,
        "description": "Get the full cap sheet for an NBA team — all player contracts and total salary.",
        "parameters": {
            "type": "object",
            "properties": {
                "team_abbreviation": {
                    "type": "string",
                    "description": "Team abbreviation (e.g. 'LAL', 'BOS', 'GSW')",
                },
            },
            "required": ["team_abbreviation"],
        },
    },
    "get_free_agents": {
        "function": get_free_agents,
        "description": "Get a list of free agents (players without active contracts), optionally filtered by position.",
        "parameters": {
            "type": "object",
            "properties": {
                "position": {
                    "type": "string",
                    "description": "Filter by position (e.g. 'G', 'F', 'C'). Optional.",
                },
            },
            "required": [],
        },
    },
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
    "get_team_roster": {
        "function": get_team_roster,
        "description": "Get the current roster for an NBA team by abbreviation.",
        "parameters": {
            "type": "object",
            "properties": {
                "team_abbreviation": {
                    "type": "string",
                    "description": "Team abbreviation (e.g. 'LAL', 'BOS')",
                },
            },
            "required": ["team_abbreviation"],
        },
    },
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
    "analyze_trade": {
        "function": analyze_trade,
        "description": "Analyze a proposed trade between two teams. Checks salary matching and CBA compliance.",
        "parameters": {
            "type": "object",
            "properties": {
                "team1_players": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of player names team 1 is sending",
                },
                "team2_players": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of player names team 2 is sending",
                },
            },
            "required": ["team1_players", "team2_players"],
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
