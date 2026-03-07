"""Base agent with tool-calling loop."""

import json
import traceback
from typing import AsyncGenerator

from backend.agents.llm_client import chat_completion, LLM_PROVIDER
from backend.tools.registry import get_openai_tools_schema, get_tool_function, TOOL_REGISTRY

MAX_TOOL_ROUNDS = 5


class BaseAgent:
    """Base agent that handles LLM interaction with tool calling."""

    def __init__(self, system_prompt: str, available_tools: list[str]):
        self.system_prompt = system_prompt
        self.available_tools = available_tools

    def _get_tools_schema(self) -> list[dict]:
        """Get OpenAI-format tool schemas for this agent's available tools."""
        all_tools = get_openai_tools_schema()
        return [t for t in all_tools if t["function"]["name"] in self.available_tools]

    async def run(self, user_message: str) -> AsyncGenerator[dict, None]:
        """
        Run the agent with a user message.
        Yields event dicts: text_delta, tool_call, tool_result, done.
        """
        # Append /no_think for Ollama/Qwen3 to disable thinking mode
        effective_message = user_message
        if LLM_PROVIDER == "ollama":
            effective_message = user_message + " /no_think"

        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": effective_message},
        ]
        tools_schema = self._get_tools_schema() if self.available_tools else None

        for round_num in range(MAX_TOOL_ROUNDS):
            tool_calls_this_round = []
            text_this_round = ""

            try:
                async for event in chat_completion(messages, tools=tools_schema, stream=True):
                    if event["type"] == "text_delta":
                        text_this_round += event["data"]
                        yield event
                    elif event["type"] == "tool_call":
                        tool_calls_this_round.append(event["data"])
                        yield event
                    elif event["type"] == "done":
                        pass  # We handle done at the end
            except Exception as e:
                yield {"type": "text_delta", "data": f"\n\n[Error communicating with LLM: {e}]"}
                yield {"type": "done", "data": None}
                return

            # If no tool calls, we're done
            if not tool_calls_this_round:
                yield {"type": "done", "data": None}
                return

            # Add assistant message with tool calls to history
            if LLM_PROVIDER == "anthropic":
                # Anthropic uses different message format for tool results
                assistant_content = []
                if text_this_round:
                    assistant_content.append({"type": "text", "text": text_this_round})
                for tc in tool_calls_this_round:
                    assistant_content.append({
                        "type": "tool_use",
                        "id": tc["id"],
                        "name": tc["name"],
                        "input": tc["arguments"],
                    })
                messages.append({"role": "assistant", "content": assistant_content})
            else:
                # OpenAI format
                assistant_msg = {"role": "assistant", "content": text_this_round or None}
                assistant_msg["tool_calls"] = [
                    {
                        "id": tc["id"],
                        "type": "function",
                        "function": {
                            "name": tc["name"],
                            "arguments": json.dumps(tc["arguments"]),
                        },
                    }
                    for tc in tool_calls_this_round
                ]
                messages.append(assistant_msg)

            # Execute tool calls
            for tc in tool_calls_this_round:
                tool_name = tc["name"]
                tool_args = tc["arguments"]
                tool_id = tc["id"]

                fn = get_tool_function(tool_name)
                if fn is None:
                    result = {"error": f"Unknown tool: {tool_name}"}
                else:
                    try:
                        result = await fn(**tool_args)
                    except Exception as e:
                        result = {"error": f"Tool execution error: {str(e)}"}
                        traceback.print_exc()

                result_str = json.dumps(result, default=str)

                yield {
                    "type": "tool_result",
                    "data": {
                        "tool_call_id": tool_id,
                        "name": tool_name,
                        "result": result,
                    },
                }

                # Add tool result to messages
                if LLM_PROVIDER == "anthropic":
                    messages.append({
                        "role": "user",
                        "content": [{
                            "type": "tool_result",
                            "tool_use_id": tool_id,
                            "content": result_str,
                        }],
                    })
                else:
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_id,
                        "content": result_str,
                    })

        # If we hit max rounds, emit done
        yield {"type": "text_delta", "data": "\n\n[Reached maximum tool call rounds]"}
        yield {"type": "done", "data": None}
