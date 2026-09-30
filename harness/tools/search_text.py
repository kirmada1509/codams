import subprocess

from pydantic import BaseModel, Field

from .base import Tool


class SearchTextArgs(BaseModel):
    query: str = Field(
        description="Text or regex pattern to search for"
    )
    path: str = Field(
        default=".",
        description="Directory or file to search in"
    )
    max_results: int = Field(
        default=50,
        ge=1,
        le=200,
        description="Maximum number of matching lines to return"
    )


class SearchTextTool(Tool[SearchTextArgs]):
    name = "search_text"
    description = "Search for text or regex patterns across files using ripgrep"
    args_schema = SearchTextArgs

    def run(self, args: SearchTextArgs) -> str:
        result = subprocess.run(
            [
                "rg",
                "--line-number",
                "--no-heading",
                "--color",
                "never",
                args.query,
                args.path,
            ],
            capture_output=True,
            text=True,
        )

        # rg exit codes:
        # 0 = matches found
        # 1 = no matches
        # 2+ = actual error
        if result.returncode == 1:
            return f"No matches found for: {args.query}"

        if result.returncode != 0:
            raise RuntimeError(result.stderr.strip())

        lines = result.stdout.splitlines()[:args.max_results]

        return "\n".join([
            f"QUERY: {args.query}",
            f"PATH: {args.path}",
            f"MATCHES: {len(lines)}",
            "",
            "--- BEGIN MATCHES ---",
            *lines,
            "--- END MATCHES ---",
        ])