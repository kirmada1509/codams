from pathlib import Path

from pydantic import BaseModel, Field

from harness.tools.base import Tool

class WriteFileArgs(BaseModel):
    path: str = Field(
        description="Path of the file to create or overwrite"
    )
    content: str = Field(
        description="Complete contents to write to the file"
    )

class WriteFileTool(Tool[WriteFileArgs]):
    name = "write_file"
    description = "Create a new file or completely overwrite an existing file"
    args_schema = WriteFileArgs

    def run(self, args: WriteFileArgs) -> str:
        path = Path(args.path)
        path_exists = path.exists()

        path.parent.mkdir(parents=True, exist_ok=True)
        
        content = args.content
        path.write_text(content, encoding="utf-8")

        output = [
            f"FILE: {path}",
            f"STATUS: {'Overwritten' if path_exists else 'Created'}",
            f"BYTES: {len(content.encode('utf-8'))}",
        ]
        
        return "\n".join(output)

if __name__ == "__main__":
    tool = WriteFileTool()
    args = WriteFileArgs(path="test.txt", content="Hello, World!\nThis is a test file.")
    print(tool.run(args))