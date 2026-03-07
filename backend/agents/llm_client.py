"""LLM client abstraction — supports Ollama (via OpenAI SDK) and Anthropic."""

import os
import json
from typing import AsyncGenerator
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama")


def _get_ollama_client():
    from openai import AsyncOpenAI
    return AsyncOpenAI(
        base_url="http://localhost:11434/v1",
        api_key="ollama",
    )


def _get_anthropic_client():
    from anthropic import AsyncAnthropic
    return AsyncAnthropic()


async def chat_completion(
    messages: list[dict],
    tools: list[dict] | None = None,
    stream: bool = True,
) -> AsyncGenerator[dict, None]:
    """
    Send a chat completion request and yield SSE-style event dicts.

    Each yielded dict has:
      type: "text_delta" | "tool_call" | "done"
      data: str (for text_delta) or dict (for tool_call)
    """
    if LLM_PROVIDER == "anthropic":
        async for event in _anthropic_completion(messages, tools, stream):
            yield event
    else:
        async for event in _ollama_completion(messages, tools, stream):
            yield event


async def _ollama_completion(
    messages: list[dict],
    tools: list[dict] | None = None,
    stream: bool = True,
) -> AsyncGenerator[dict, None]:
    client = _get_ollama_client()
    model = os.getenv("OLLAMA_MODEL", "qwen3:30b-a3b")

    kwargs = {
        "model": model,
        "messages": messages,
        "stream": stream,
    }
    if tools:
        kwargs["tools"] = tools

    if stream:
        collected_tool_calls = {}
        async with await client.chat.completions.create(**kwargs) as response:
            async for chunk in response:
                choice = chunk.choices[0] if chunk.choices else None
                if not choice:
                    continue
                delta = choice.delta

                # Text content
                if delta and delta.content:
                    yield {"type": "text_delta", "data": delta.content}

                # Tool calls (streamed in parts)
                if delta and delta.tool_calls:
                    for tc in delta.tool_calls:
                        idx = tc.index
                        if idx not in collected_tool_calls:
                            collected_tool_calls[idx] = {
                                "id": tc.id or f"call_{idx}",
                                "name": "",
                                "arguments": "",
                            }
                        if tc.function:
                            if tc.function.name:
                                collected_tool_calls[idx]["name"] = tc.function.name
                            if tc.function.arguments:
                                collected_tool_calls[idx]["arguments"] += tc.function.arguments
                        if tc.id:
                            collected_tool_calls[idx]["id"] = tc.id

                # Check for finish
                if choice.finish_reason == "tool_calls" or choice.finish_reason == "stop":
                    pass

        # Emit collected tool calls
        for idx in sorted(collected_tool_calls.keys()):
            tc = collected_tool_calls[idx]
            try:
                args = json.loads(tc["arguments"]) if tc["arguments"] else {}
            except json.JSONDecodeError:
                args = {}
            yield {
                "type": "tool_call",
                "data": {
                    "id": tc["id"],
                    "name": tc["name"],
                    "arguments": args,
                },
            }

        yield {"type": "done", "data": None}
    else:
        response = await client.chat.completions.create(**kwargs)
        choice = response.choices[0]
        if choice.message.content:
            yield {"type": "text_delta", "data": choice.message.content}
        if choice.message.tool_calls:
            for tc in choice.message.tool_calls:
                try:
                    args = json.loads(tc.function.arguments) if tc.function.arguments else {}
                except json.JSONDecodeError:
                    args = {}
                yield {
                    "type": "tool_call",
                    "data": {
                        "id": tc.id,
                        "name": tc.function.name,
                        "arguments": args,
                    },
                }
        yield {"type": "done", "data": None}


async def _anthropic_completion(
    messages: list[dict],
    tools: list[dict] | None = None,
    stream: bool = True,
) -> AsyncGenerator[dict, None]:
    """Anthropic Claude completion — convert OpenAI format to Anthropic format."""
    client = _get_anthropic_client()
    model = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514")

    # Extract system message
    system_msg = ""
    chat_messages = []
    for m in messages:
        if m["role"] == "system":
            system_msg = m["content"]
        else:
            chat_messages.append(m)

    # Convert OpenAI tools format to Anthropic format
    anthropic_tools = []
    if tools:
        for t in tools:
            fn = t.get("function", {})
            anthropic_tools.append({
                "name": fn["name"],
                "description": fn.get("description", ""),
                "input_schema": fn.get("parameters", {"type": "object", "properties": {}}),
            })

    kwargs = {
        "model": model,
        "max_tokens": 4096,
        "messages": chat_messages,
    }
    if system_msg:
        kwargs["system"] = system_msg
    if anthropic_tools:
        kwargs["tools"] = anthropic_tools

    if stream:
        async with client.messages.stream(**kwargs) as response:
            async for event in response:
                if hasattr(event, "type"):
                    if event.type == "content_block_delta":
                        if hasattr(event.delta, "text"):
                            yield {"type": "text_delta", "data": event.delta.text}
                    elif event.type == "content_block_stop":
                        pass
        # Handle tool use from the final message
        final = await response.get_final_message()
        for block in final.content:
            if block.type == "tool_use":
                yield {
                    "type": "tool_call",
                    "data": {
                        "id": block.id,
                        "name": block.name,
                        "arguments": block.input,
                    },
                }
        yield {"type": "done", "data": None}
    else:
        response = await client.messages.create(**kwargs)
        for block in response.content:
            if block.type == "text":
                yield {"type": "text_delta", "data": block.text}
            elif block.type == "tool_use":
                yield {
                    "type": "tool_call",
                    "data": {
                        "id": block.id,
                        "name": block.name,
                        "arguments": block.input,
                    },
                }
        yield {"type": "done", "data": None}
