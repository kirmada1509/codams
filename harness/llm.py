import os

from openai import AsyncOpenAI, base_url

from dotenv import load_dotenv
load_dotenv()


class LLMClient:
    base_url = "https://integrate.api.nvidia.com/v1"
    api_key = os.getenv("NVIDIA_API_KEY")
    def __init__(self):
        self.client = self.create_client()

    def create_client(self):
        return AsyncOpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
            timeout=30.0,
        )

    def respond(self, messages, tools):
        return self.client.responses.create(
            model="nvidia/nemotron-3-ultra-550b-a55b",
            input=messages,
            tools=tools
        )

if __name__ == "__main__":
    import asyncio

    async def main():
        llm_client = LLMClient()
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello, how are you?"},
        ]
        tools = []
        response = await llm_client.respond(messages, tools)
        print(response.output)

    asyncio.run(main())