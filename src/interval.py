import base64
import requests
import os

# 默认使用环境变量，也可以在调用时传入
DEFAULT_API_KEY = os.getenv("INTERVALS_API_KEY", "my-api-key")
DEFAULT_ATHLETE_ID = os.getenv("INTERVALS_ATHLETE_ID", "my-athlete-id")
BASE_URL = "https://intervals.icu/api/v1"

def encode_api_key(api_key: str):
    # Intervals.icu uses "API_KEY" as the username
    return base64.b64encode(f"API_KEY:{api_key}".encode("utf-8")).decode("utf-8")

def upload_workouts(workouts: list, api_key: str = DEFAULT_API_KEY, athlete_id: str = DEFAULT_ATHLETE_ID):
    """
    Upload a list of workouts to Intervals.icu.
    Endpoint: POST /api/v1/athlete/{id}/events/bulk
    """
    if not api_key or api_key == "my-api-key":
        raise ValueError("API Key is missing. Set INTERVALS_API_KEY env var or pass it explicitly.")
    
    if not athlete_id or athlete_id == "my-athlete-id":
        # Try to fetch self if athlete_id is missing
        pass 

    headers = {
        "Authorization": f"Basic {encode_api_key(api_key)}",
        "Content-Type": "application/json",
    }
    
    url = f"{BASE_URL}/athlete/{athlete_id}/events/bulk"
    
    # Ensure the data is a list, even if single item passed
    if not isinstance(workouts, list):
        workouts = [workouts]

    response = requests.post(url, headers=headers, json=workouts)
    
    if response.status_code in [200, 201]:
        return response.json()
    else:
        raise Exception(f"Failed to upload workouts: {response.status_code} {response.text}")

def get_athlete_id(api_key: str = DEFAULT_API_KEY):
    """Helper to get the current athlete ID (self)"""
    headers = {
        "Authorization": f"Basic {encode_api_key(api_key)}",
    }
    response = requests.get(f"{BASE_URL}/athlete/0", headers=headers) # 0 usually means 'me' in some APIs, but intervals might require explicit ID. 
    # Intervals.icu /athlete/0 usually redirects to the authenticated athlete or returns their data.
    if response.status_code == 200:
        return response.json().get("id")
    return None
