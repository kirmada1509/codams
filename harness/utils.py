from typing import Any

from json import dumps

def to_json(obj: Any) -> str:
    return dumps(obj.__dict__, indent=2)