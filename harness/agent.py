from enum import Enum
import json

from openai import BaseModel

from harness.llm import LLMClient
from harness.tools.registry import ToolRegistry


class Agent:
    def __init__(self, name: str):
        self.name = name
        self.transcript: list = []
        self.registry = ToolRegistry()
        self.llm = LLMClient()

    def add_to_transcript(self, message: dict | list):
        if isinstance(message, list):
            self.transcript.extend(message)
        else:
            self.transcript.append(message)

    async def run_agent(self):
        self.add_to_transcript({"role": "system", "content": f"You are {self.name}, a simple coding assistant, with following tools available: {json.dumps(self.registry.get_tool_list())}"})
        user_message = input("Enter your message to the agent: ")
        self.add_to_transcript({"role": "user", "content": user_message})

        while True:
            response = await self.llm.respond(
                messages=self.transcript,
                tools=self.registry.schemas()
            )
            self.add_to_transcript(response.output)

            tool_calls = [
                item
                for item in response.output
                if item.type == "function_call"
            ]

            if not tool_calls:
                print(f"[{self.name}]: {response.output_text}")
                print("\n--- New user message ---\n")
                user_message = input("Enter your message to the agent: ")
                self.add_to_transcript({"role": "user", "content": user_message})


            for call in tool_calls:
                arguments = json.loads(call.arguments)

                result = self.registry.execute(call.name, arguments)
                self.transcript.append({
                    "type": "function_call_output",
                    "call_id": call.call_id,
                    "output": result,
                })


if __name__ == "__main__":
    try:
        import asyncio

        agent = Agent(name="Codams")
        asyncio.run(agent.run_agent())
        
    except KeyboardInterrupt as e:
        print(f"\nAgent terminated by user {e}")