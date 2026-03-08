"""Orchestrator — routes user messages to the appropriate specialist agent."""

import re
from typing import AsyncGenerator

from backend.agents.specialists import (
    ContractAgent,
    TradeAgent,
    RosterAgent,
    CBAAgent,
    StatAnalystAgent,
)

# Keyword patterns for routing (checked in order, first match wins)
# CBA patterns come before contract so "salary cap", "cap space" etc. route to CBA
ROUTE_PATTERNS = [
    (r"\b(trade|deal|swap|package|send|acquire|trade\s?machine)\b|salary.?match", "trade"),
    (r"\b(salary\s?cap|cap\s?(space|situation|room)|luxury\s?tax|apron|exception|mle|bae|cba|rule|sign-and-trade|bird\s?rights)\b", "cba"),
    (r"\b(contract|salary|cap\s?hit|cap\s?sheet|money|pay|paid|earning|making|worth)\b", "contract"),
    (r"\b(roster|lineup|team\s?roster|depth\s?chart|players?\s?on)\b", "roster"),
]


def classify_intent(message: str) -> str:
    """Classify user intent based on keywords. Returns agent type string."""
    lower = message.lower()
    for pattern, agent_type in ROUTE_PATTERNS:
        if re.search(pattern, lower):
            return agent_type
    # Default fallback
    return "stats"


# Agent factory
_AGENT_MAP = {
    "trade": TradeAgent,
    "contract": ContractAgent,
    "cba": CBAAgent,
    "roster": RosterAgent,
    "stats": StatAnalystAgent,
}


class OrchestratorAgent:
    """Routes user messages to the appropriate specialist agent."""

    async def run(self, user_message: str) -> AsyncGenerator[dict, None]:
        """Classify intent, pick a specialist, and delegate."""
        intent = classify_intent(user_message)
        agent_cls = _AGENT_MAP[intent]
        agent = agent_cls()

        # Emit a routing event so the frontend knows which specialist is handling it
        yield {
            "type": "routing",
            "data": {"intent": intent, "agent": agent_cls.__name__},
        }

        async for event in agent.run(user_message):
            yield event
