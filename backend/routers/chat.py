"""Chat endpoint — SSE streaming."""

import json
from fastapi import APIRouter
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from backend.agents.orchestrator import OrchestratorAgent

router = APIRouter(prefix="/api", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


@router.post("/chat")
async def chat(request: ChatRequest):
    """Stream agent responses as Server-Sent Events."""
    orchestrator = OrchestratorAgent()

    async def event_generator():
        try:
            async for event in orchestrator.run(request.message):
                event_data = {
                    "type": event["type"],
                    "data": event.get("data"),
                }
                yield {
                    "event": event["type"],
                    "data": json.dumps(event_data, default=str),
                }
        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"type": "error", "data": str(e)}),
            }
            yield {
                "event": "done",
                "data": json.dumps({"type": "done", "data": None}),
            }

    return EventSourceResponse(event_generator())
