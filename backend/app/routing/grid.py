import math
from typing import List, Tuple, Dict, Set

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate Great Circle distance between two coordinates in kilometers."""
    R = 6371.0  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

class NavGrid:
    """Discretized polar navigational corridor grid."""

    def __init__(
        self,
        start: Tuple[float, float],
        dest: Tuple[float, float],
        resolution_deg: float = 0.35,
        padding_deg: float = 2.0
    ):
        self.start = (round(start[0], 4), round(start[1], 4))
        self.dest = (round(dest[0], 4), round(dest[1], 4))
        self.res = resolution_deg

        # Calculate bounding box
        self.min_lat = max(-90.0, min(start[0], dest[0]) - padding_deg)
        self.max_lat = min(-50.0, max(start[0], dest[0]) + padding_deg)
        self.min_lon = min(start[1], dest[1]) - padding_deg
        self.max_lon = max(start[1], dest[1]) + padding_deg

        # Generate grid nodes
        self.nodes: Set[Tuple[float, float]] = set()
        lat = self.min_lat
        while lat <= self.max_lat:
            lon = self.min_lon
            while lon <= self.max_lon:
                self.nodes.add((round(lat, 4), round(lon, 4)))
                lon += self.res
            lat += self.res

        # Ensure start and dest are part of the grid
        self.nodes.add(self.start)
        self.nodes.add(self.dest)

    def get_neighbors(self, node: Tuple[float, float]) -> List[Tuple[float, float]]:
        """Get 8-connected neighboring coordinates within corridor bounds."""
        lat, lon = node
        neighbors = []
        d_lats = [-self.res, 0.0, self.res]
        d_lons = [-self.res, 0.0, self.res]

        for d_lat in d_lats:
            for d_lon in d_lons:
                if d_lat == 0.0 and d_lon == 0.0:
                    continue
                n_lat = round(lat + d_lat, 4)
                n_lon = round(lon + d_lon, 4)
                if self.min_lat <= n_lat <= self.max_lat and self.min_lon <= n_lon <= self.max_lon:
                    neighbors.append((n_lat, n_lon))

        # Always check if destination is close enough to step directly into it
        if haversine_distance_km(lat, lon, self.dest[0], self.dest[1]) <= self.res * 150.0:
            neighbors.append(self.dest)

        return neighbors
