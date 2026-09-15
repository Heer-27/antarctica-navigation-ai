import logging
import sys

def setup_logging():
    """Configure scientific technical logging format."""
    log_format = "%(asctime)s [%(levelname)s] [POLAR-CORE] %(name)s: %(message)s"
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    # Silence overly verbose external loggers
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("urllib3").setLevel(logging.WARNING)

logger = logging.getLogger("antarctic_ai")
