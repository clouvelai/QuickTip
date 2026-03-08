"""Specialist agents for different NBA GM tasks."""

from backend.agents.base_agent import BaseAgent


class TradeAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            system_prompt=(
                "You are a co-pilot for the BDL Trade Machine (trade.balldontlie.io). "
                "You help users explore, build, and validate NBA trades. "
                "When analyzing trades, use bdl_validate_trade to check CBA compliance "
                "via the official trade machine API. When presenting trade ideas, always "
                "include a trade machine link via bdl_build_trade_url so the user can "
                "load it directly in the Trade Machine. Use bdl_find_salary_matches to find "
                "salary-matching trade packages when users ask about trading a specific player. "
                "You can look up any team's roster, cap situation, and player stats. "
                "Format salaries clearly (e.g. $35,000,000) and always explain "
                "the CBA salary matching implications."
            ),
            available_tools=[
                "bdl_get_teams",
                "bdl_get_team_roster",
                "bdl_get_team_cap",
                "bdl_validate_trade",
                "bdl_build_trade_url",
                "bdl_find_salary_matches",
                "check_trade_salary_match",
                "get_cap_info",
                "get_available_exceptions",
                "get_player_season_stats",
                "get_player_career_stats",
            ],
        )


class ContractAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            system_prompt=(
                "You are an NBA contract specialist. You help GMs understand player contracts, "
                "cap hits, salary details, team cap sheets, and salary cap implications. "
                "Use your tools to look up real contract and cap data. Be precise with dollar amounts "
                "and always format salaries clearly (e.g. $35,000,000). "
                "When analyzing cap sheets, note how close teams are to the luxury tax and apron lines."
            ),
            available_tools=[
                "bdl_get_team_roster",
                "bdl_get_team_cap",
                "get_cap_info",
                "get_available_exceptions",
            ],
        )


class RosterAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            system_prompt=(
                "You are an NBA roster construction specialist. You help GMs understand "
                "team rosters, player profiles, and how to build a competitive team. "
                "Use your tools to look up rosters, player bios, and stats. "
                "Consider positional balance, age, and development when analyzing rosters."
            ),
            available_tools=[
                "bdl_get_team_roster",
                "get_player_profile",
                "get_player_season_stats",
                "get_player_career_stats",
            ],
        )


class CBAAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            system_prompt=(
                "You are an NBA CBA (Collective Bargaining Agreement) expert. You help GMs "
                "understand salary cap rules, luxury tax implications, trade exceptions, "
                "and available signing exceptions. Explain rules clearly and reference "
                "specific dollar thresholds. You know the 2024-25 CBA inside and out."
            ),
            available_tools=[
                "get_cap_info",
                "check_trade_salary_match",
                "get_available_exceptions",
                "bdl_get_team_cap",
            ],
        )


class StatAnalystAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            system_prompt=(
                "You are an NBA statistical analyst. You help GMs evaluate players using "
                "stats, identify league leaders, and compare player performance across seasons. "
                "Use your tools to look up real stats. Provide context for numbers — "
                "explain what makes a stat line impressive or concerning. "
                "You can also look up player profiles and rosters for a complete picture."
            ),
            available_tools=[
                "get_player_season_stats",
                "get_player_career_stats",
                "get_stat_leaders",
                "get_player_profile",
                "bdl_get_team_roster",
            ],
        )
