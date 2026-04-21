import requests
import json
from datetime import datetime

USER_ID = "30" # The integer ID from the logs
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoYXNoX2lkIjoiOWY3Njc5NGMtYjUwMi00MTAxLTlhY2MtYWZhNjkzYzU2ODJmIiwiaWF0IjoxNzc2NTI2MTIzLCJleHAiOjE4MDgwNjIxMjN9.ZYiWgHtuVCID851--I_UYdp7GjM3D1u-YHYNrDcuwTQ"
BASE_URL = "https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com"

def test_user_flow():
    print(f"--- DIAGNOSTIC (USER 30): {datetime.now()} ---")
    
    headers = {
        "Authorization": f"Bearer {TOKEN}"
    }
    
    # 1. Check User Stats/Logs
    print("\n1. Fetching Stats for User '30'...")
    try:
        r = requests.get(f"{BASE_URL}/user/{USER_ID}", headers=headers)
        print(f"Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            # Handle different nested structures
            logs = data.get('gameLogs', data.get('data', {}).get('gameLogs', []))
            print(f"Found {len(logs)} logs.")
            for log in logs:
                print(f"  - {log.get('g_id')} | {log.get('status')} | {log.get('created_at')}")
    except Exception as e:
        print(f"Fetch failed: {e}")

if __name__ == "__main__":
    test_user_flow()
