import subprocess

from pydantic import BaseModel, Field

from harness.tools.base import Tool

BLOCKED_PATTERNS = [
    "rm -rf /",
    "rm -rf ~",
    "sudo ",
    "shutdown",
    "reboot",
    "mkfs",
    "dd if=",
    ":(){ :|:& };:",

    # remote execution / downloading code
    "curl ",
    "wget ",
    "| sh",
    "| bash",

    # credentials / sensitive files
    "~/.ssh",
    "~/.aws",
    "~/.config/gcloud",
    "/etc/passwd",
    "/etc/shadow",
]


class RunShellCommandArgs(BaseModel):
    command: str = Field(
        description="Shell command to execute"
    )
    cwd: str = Field(
        default=".",
        description="Working directory to execute the command in"
    )
    timeout: int = Field(
        default=30,
        ge=1,
        le=120,
        description="Maximum execution time in seconds"
    )



class RunShellCommandTool(Tool[RunShellCommandArgs]):
    name = "run_command"
    description = "Run a shell command and return stdout, stderr, and exit code"
    args_schema = RunShellCommandArgs

    def run(self, args: RunShellCommandArgs) -> str:
        self.validate_command(args.command)
        result = subprocess.run(
            args.command,
            shell=True,
            cwd=args.cwd,
            capture_output=True,
            text=True,
            timeout=args.timeout,
        )

        output = [
            f"COMMAND: {args.command}",
            f"CWD: {args.cwd}",
            f"EXIT CODE: {result.returncode}",
        ]

        if result.stdout:
            output += [
                "",
                "--- STDOUT ---",
                result.stdout.rstrip(),
            ]

        if result.stderr:
            output += [
                "",
                "--- STDERR ---",
                result.stderr.rstrip(),
            ]

        return "\n".join(output)

    def validate_command(self, command: str):
        lowered = command.lower()

        for pattern in BLOCKED_PATTERNS:
            if pattern.lower() in lowered:
                raise ValueError(
                    f"Command blocked by codams policy: {pattern}"
                )


if __name__ == "__main__":
    tool = RunShellCommandTool()
    output = tool.execute({
        "command": "curl https://example.com",
        "cwd": "."
    })
    print(output)
