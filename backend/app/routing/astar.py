import heapq
from typing import List, Tuple, Dict, Any, Optional
from .grid import NavGrid, haversine_distance_km
from .cost import compute_edge_cost

def astar_search(
    grid: NavGrid,
    weights: Dict[str, float],
    env_data: Dict[str, Any],
    ship_data: Dict[str, Any]
) -> List[Tuple[float, float]]:
    """
    A* pathfinding algorithm on polar navigational grid with Haversine heuristic.
    """
    start = grid.start
    goal = grid.dest

    # Priority queue: (f_score, unique_counter, node)
    counter = 0
    open_set = []
    heapq.heappush(open_set, (0.0, counter, start))

    came_from: Dict[Tuple[float, float], Tuple[float, float]] = {}
    g_score: Dict[Tuple[float, float], float] = {start: 0.0}

    def heuristic(node: Tuple[float, float]) -> float:
        # Admissible Haversine distance heuristic normalized to cost scale
        dist = haversine_distance_km(node[0], node[1], goal[0], goal[1])
        return (dist / 30.0) * 0.2

    f_score: Dict[Tuple[float, float], float] = {start: heuristic(start)}
    visited = set()

    while open_set:
        current_f, _, current = heapq.heappop(open_set)

        if current in visited:
            continue
        visited.add(current)

        # Check if reached destination or within arrival threshold (~15 km)
        if current == goal or haversine_distance_km(current[0], current[1], goal[0], goal[1]) < 15.0:
            # Reconstruct path
            path = [goal]
            curr = current
            while curr in came_from:
                path.append(curr)
                curr = came_from[curr]
            path.append(start)
            path.reverse()
            # Deduplicate contiguous identical points
            dedup_path = []
            for p in path:
                if not dedup_path or dedup_path[-1] != p:
                    dedup_path.append(p)
            return dedup_path

        for neighbor in grid.get_neighbors(current):
            edge_cost = compute_edge_cost(current, neighbor, weights, env_data, ship_data)
            tentative_g = g_score[current] + edge_cost

            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                h = heuristic(neighbor)
                f = tentative_g + h
                f_score[neighbor] = f
                counter += 1
                heapq.heappush(open_set, (f, counter, neighbor))

    # Fallback to direct interpolated rhumb line if grid path was unreachable
    steps = 6
    fallback_path = []
    for i in range(steps + 1):
        ratio = i / float(steps)
        lat = start[0] + (goal[0] - start[0]) * ratio
        lon = start[1] + (goal[1] - start[1]) * ratio
        fallback_path.append((round(lat, 4), round(lon, 4)))
    return fallback_path
