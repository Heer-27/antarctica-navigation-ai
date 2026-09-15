import heapq
from typing import List, Tuple, Dict, Any
from .grid import NavGrid, haversine_distance_km
from .cost import compute_edge_cost

def dijkstra_search(
    grid: NavGrid,
    weights: Dict[str, float],
    env_data: Dict[str, Any],
    ship_data: Dict[str, Any]
) -> List[Tuple[float, float]]:
    """
    Dijkstra pathfinding benchmark implementation (uniform-cost search without heuristic).
    """
    start = grid.start
    goal = grid.dest

    counter = 0
    open_set = []
    heapq.heappush(open_set, (0.0, counter, start))

    came_from: Dict[Tuple[float, float], Tuple[float, float]] = {}
    g_score: Dict[Tuple[float, float], float] = {start: 0.0}
    visited = set()

    while open_set:
        current_cost, _, current = heapq.heappop(open_set)

        if current in visited:
            continue
        visited.add(current)

        if current == goal or haversine_distance_km(current[0], current[1], goal[0], goal[1]) < 15.0:
            path = [goal]
            curr = current
            while curr in came_from:
                path.append(curr)
                curr = came_from[curr]
            path.append(start)
            path.reverse()
            return path

        for neighbor in grid.get_neighbors(current):
            edge_cost = compute_edge_cost(current, neighbor, weights, env_data, ship_data)
            tentative_g = g_score[current] + edge_cost

            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                counter += 1
                heapq.heappush(open_set, (tentative_g, counter, neighbor))

    return [start, goal]
