"""
API Routers package.
"""

from .health import router as health_router
from .sea_ice import router as sea_ice_router
from .icebergs import router as icebergs_router
from .weather import router as weather_router
from .ocean import router as ocean_router
from .ships import router as ships_router
from .route import router as route_router

__all__ = [
    "health_router", "sea_ice_router", "icebergs_router",
    "weather_router", "ocean_router", "ships_router", "route_router"
]
