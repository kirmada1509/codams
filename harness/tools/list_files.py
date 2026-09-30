from pathlib import Path

from pydantic import BaseModel, Field

from harness.tools.base import Tool


class ListFilesArgs(BaseModel):
    path: str = Field(description="Path of the directory to list, relative to the repository root")


class ListFilesTool(Tool[ListFilesArgs]):
    name = "list_files"
    description = "Lists the files in a directory"
    args_schema = ListFilesArgs

    def run(self, args: ListFilesArgs) -> str:
        path = Path(args.path)
        dirs = [dir for dir in path.iterdir() if dir.is_dir()]
        files = [file for file in path.iterdir() if file.is_file()]

        output = [
            f"Directory: {path}",
            "",
            "--- DIRECTORIES ---",
            *[f"{dir.name}/" for dir in dirs],
            "",
            "--- FILES ---",
            *[file.name for file in files],
        ]

        return "\n".join(output)