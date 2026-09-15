import hmac
import hashlib
from typing import Optional
from .config import settings

def verify_token(token: str) -> bool:
    """Simple constant-time token comparison for basic endpoint protection."""
    if not token:
        return False
    return hmac.compare_digest(token, settings.SECRET_KEY)

def sanitize_string(val: Optional[str]) -> str:
    """Sanitize user-provided text inputs."""
    if not val:
        return ""
    # Strip dangerous HTML/script characters
    return val.replace("<", "").replace(">", "").strip()
