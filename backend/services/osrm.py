import math
import requests
import logging

logger = logging.getLogger(__name__)

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the Great Circle / Haversine distance between two points on earth in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return round(distance, 2)

def calculate_route(lat1: float, lon1: float, lat2: float, lon2: float):
    """
    Calls OpenStreetMap OSRM routing engine API.
    Returns: dict(distance_km, duration_str, duration_minutes, polyline_coords, is_fallback)
    """
    url = f"http://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson"
    try:
        response = requests.get(url, timeout=3.0)
        if response.status_code == 200:
            data = response.json()
            if data.get("code") == "Ok" and len(data.get("routes", [])) > 0:
                route = data["routes"][0]
                distance_meters = route["distance"]
                duration_seconds = route["duration"]
                
                distance_km = round(distance_meters / 1000.0, 1)
                duration_mins = int(round(duration_seconds / 60.0))
                
                hours = duration_mins // 60
                mins = duration_mins % 60
                if hours > 0:
                    duration_str = f"{hours} hr {mins} min"
                else:
                    duration_str = f"{mins} min"
                    
                geometry = route.get("geometry", {}).get("coordinates", [])
                # Convert OSRM [lon, lat] pairs to [lat, lon] for Leaflet
                leaflet_coords = [[pt[1], pt[0]] for pt in geometry]
                
                return {
                    "distance_km": distance_km if distance_km > 0.5 else 1.0,
                    "duration_str": duration_str,
                    "duration_minutes": duration_mins,
                    "polyline_coords": leaflet_coords,
                    "is_fallback": False
                }
    except Exception as e:
        logger.warning(f"OSRM service unavailable or timed out: {e}. Using Haversine fallback.")

    # Fallback to Haversine straight line x 1.3 (estimated driving road factor)
    direct_dist = haversine_distance(lat1, lon1, lat2, lon2)
    road_dist = round(max(direct_dist * 1.3, 1.0), 1)
    # Estimate average speed 40 km/h for local trucks
    est_mins = max(int(round((road_dist / 40.0) * 60)), 15)
    hours = est_mins // 60
    mins = est_mins % 60
    duration_str = f"{hours} hr {mins} min (Est.)" if hours > 0 else f"{mins} min (Est.)"
    
    return {
        "distance_km": road_dist,
        "duration_str": duration_str,
        "duration_minutes": est_mins,
        "polyline_coords": [[lat1, lon1], [lat2, lon2]],
        "is_fallback": True
    }
