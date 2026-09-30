from pathlib import Path

from pydantic import BaseModel, Field

from harness.tools.base import Tool

LANGUAGES = {
    "ts": "typescript",
    "tsx": "typescript",
    "js": "javascript",
    "jsx": "javascript",
    "py": "python",
    "go": "go",
    "rs": "rust",
    "cpp": "cpp",
    "c": "c",
    "java": "java",
}

class ReadFileArgs(BaseModel):
    path: str = Field(description="Path of the file to read, relative to the repository root")
    start_line: int | None = Field(default=None, ge=1, description="The starting line number to read from (1-indexed)")
    end_line: int | None = Field(default=None, ge=1, description="The ending line number to read to (1-indexed)")


class ReadFileTool(Tool[ReadFileArgs]):
    name = 'read_file'
    description = "Read a file from disk"
    args_schema = ReadFileArgs

    def run(self, args: ReadFileArgs) -> str:
        file = Path(args.path)
        start_line = args.start_line
        end_line = args.end_line

        language = self.get_language(args.path)
        
        lines = file.read_text(encoding="utf-8").splitlines()

        if start_line is None:
            start_line = 1
        start_line = max(1, start_line)

        if end_line is None:
            end_line = len(lines)
        end_line = min(len(lines), end_line)

        selected_lines = lines[start_line - 1:end_line]
        numbered = [
            f"{i} | {line.rstrip()}" 
            for i, line in enumerate(selected_lines, start=start_line)
        ]

        output = [
            f"FILE: {args.path}",
            f"LINES: {start_line}-{end_line}",
            f"LANGUAGE: {language}",
            "",
            "--- BEGIN FILE ---",
            *numbered,
            "--- END FILE ---",
        ]

        return "\n".join(output)
    
    def get_language(self, path: str) -> str:
        extension = path.split(".")[-1]
        return LANGUAGES.get(extension, "Unknown")
