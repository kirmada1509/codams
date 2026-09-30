import json

from harness.tools.base import Tool


class ToolRegistry:
    def __init__(self):
        self.tools: dict[str, Tool] = {}
        self.register_available_tools()

    def register(self, tool: Tool) -> None:
        if tool.name in self.tools:
            raise ValueError(f"Tool '{tool.name}' is already registered.")
        self.tools[tool.name] = tool

    def get(self, name: str) -> Tool:
        if name not in self.tools:
            raise ValueError(f"Tool '{name}' is not registered.")
        return self.tools[name]

    def schemas(self) -> list[dict]:
        return [tool.schema() for tool in self.tools.values()]

    def get_tool_list(self) -> list[str]:
        return list(self.tools.keys())

    def execute(self, name: str, raw_args: dict) -> str:
        print(f"[tool:{name}] executing with args: {raw_args}")
        tool = self.get(name)
        return tool.execute(raw_args)
    
    def register_available_tools(self):
        from harness.tools.list_files import ListFilesTool
        from harness.tools.read_file import ReadFileTool
        from harness.tools.write_file import WriteFileTool
        from harness.tools.replace_in_file import ReplaceInFileTool
        from harness.tools.run_shell_command import RunShellCommandTool

        self.register(ListFilesTool())
        self.register(ReadFileTool())
        self.register(WriteFileTool())
        self.register(ReplaceInFileTool())
        self.register(RunShellCommandTool())


if __name__ == "__main__":
    registry = ToolRegistry()
    registry.register_available_tools()

    print(json.dumps(registry.schemas(), indent=2))