"""Specialist agents for different NBA GM tasks."""

from backend.agents.base_agent import BaseAgent


class ContractAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            system_prompt=(
                "You are an NBA contract specialist. You help GMs understand player contracts, "
                "cap hits, salary details, team cap sheets, and free agent availability. "
                "Use your tools to look up real contract data. Be precise with dollar amounts "
                "and always format salaries clearly (e.g. $35,000,000). "
                "When analyzing cap sheets, note how close teams are to the luxury tax and apron lines."
            ),
            available_tools=[
                "get_player_contract",
                "get_team_cap_sheet",
                "get_free_agents",
                "get_cap_info",
                "get_available_exceptions",
            ],
        )


class TradeAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            system_prompt=(
                "You are an NBA trade analyst. You help GMs evaluate proposed trades, "
                "checking salary matching rules, CBA compliance, and overall trade value. "
                "Use your tools to analyze trades and look up contracts. Always explain "
                "whether a trade works under CBA rules and why. Consider both salary matching "
                "and basketball value in your analysis."
            ),
            available_tools=[
                "analyze_trade",
                "get_player_contract",
                "get_team_cap_sheet",
                "get_cap_info",
                "check_trade_salary_match",
                "get_available_exceptions",
                "get_player_season_stats",
                "get_player_profile",
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
                "get_team_roster",
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
                "You can also look up player profiles and contracts for a complete picture."
            ),
            available_tools=[
                "get_player_season_stats",
                "get_player_career_stats",
                "get_stat_leaders",
                "get_player_profile",
                "get_player_contract",
            ],
        )
