from typing import Generic, TypeVar

from pydantic import BaseModel
from abc import ABC, abstractmethod

TArgs = TypeVar("TArgs", bound=BaseModel)

class Tool(ABC, Generic[TArgs]):
    name: str
    description: str
    args_schema: type[TArgs]

    @abstractmethod
    def run(self, args: TArgs) -> str:
        pass

    def schema(self):
        return {
            "type": "function",
            "name": self.name,
            "description": self.description,
            "parameters": self.args_schema.model_json_schema(),
        }
    
    def execute(self, raw_args: dict) -> str:
        try:
            args = self.args_schema.model_validate(raw_args)
            return self.run(args)
        except Exception as e:
            return f"Error executing tool '{self.name}': {str(e)}"