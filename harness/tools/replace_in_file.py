from pathlib import Path

from pydantic import BaseModel, Field

from harness.tools.base import Tool


class ReplaceInFileArgs(BaseModel):
    path: str = Field(
        description="Path of the file to modify"
    )
    old_text: str = Field(
        description="Exact text to replace"
    )
    new_text: str = Field(
        description="Replacement text"
    )

class ReplaceInFileTool(Tool[ReplaceInFileArgs]):
    name = "replace_in_file"
    description = "Replace one exact block of text in an existing file"
    args_schema = ReplaceInFileArgs

    def run(self, args: ReplaceInFileArgs) -> str:
        file = Path(args.path)
        content = file.read_text(encoding="utf-8")
        matches = content.count(args.old_text)

        if matches == 0:
            raise ValueError(f"Text '{args.old_text}' not found in file '{args.path}'")
        
        if matches == 1:
            new_content = content.replace(args.old_text, args.new_text, 1)
            file.write_text(new_content, encoding="utf-8")
            return f"Replaced '{args.old_text}' with '{args.new_text}' in {args.path}"

        lines = content.splitlines()

        candidates = []
        first_line = args.old_text.splitlines()[0]

        for i, line in enumerate(lines):
            if first_line in line:
                start = max(0, i - 2)
                end = min(len(lines), i + 3)

                preview = [
                    "\n".join(
                    f"{n + 1} | {lines[n]}"
                    for n in range(start, end)
                )]

                candidates.append("\n".join(preview))

        output = [
            f"ERROR: old_text matched {matches} times.",
            "Replacement must be unique.",
            "Matches found:",
            *candidates,
            "Include more surrounding context in old_text and retry.",
        ]

        return "\n\n".join(output)

if __name__ == "__main__":
    tool = ReplaceInFileTool()
    args = ReplaceInFileArgs(
        path="test.txt",
        old_text="Hello, World!",
        new_text="Hello, Universe!"
    )
    print(tool.run(args))