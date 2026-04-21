import requests
import json
from datetime import datetime

USER_ID = "9f76794c-b502-4101-9acc-afa693c5682f"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoYXNoX2lkIjoiOWY3Njc5NGMtYjUwMi00MTAxLTlhY2MtYWZhNjkzYzU2ODJmIiwiaWF0IjoxNzc2NTI2MTIzLCJleHAiOjE4MDgwNjIxMjN9.ZYiWgHtuVCID851--I_UYdp7GjM3D1u-YHYNrDcuwTQ"
BASE_URL = "https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com"

def test_user_flow():
    print(f"--- DIAGNOSTIC START: {datetime.now()} ---")
    print(f"Testing User ID: {USER_ID}")
    
    headers = {
        "Authorization": f"Bearer {TOKEN}"
    }
    
    # 1. Check User Stats/Logs
    print("\n1. Fetching User Stats...")
    try:
        r = requests.get(f"{BASE_URL}/user/{USER_ID}", headers=headers)
        print(f"Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            logs = data.get('gameLogs', data.get('data', {}).get('gameLogs', []))
            print(f"Found {len(logs)} logs.")
            for log in logs:
                print(f"  - {log.get('g_id')} | {log.get('status')} | {log.get('created_at')}")
        else:
            print(f"Error Body: {r.text}")
    except Exception as e:
        print(f"Fetch failed: {e}")

    # 2. Daily Lock Simulation (IST)
    print("\n2. Simulating App Lock Logic (IST)...")
    now_ist = datetime.now() # This script runs in IST context or we can offset
    today_str = now_ist.strftime("%Y-%m-%d")
    print(f"Today (Script Time): {today_str}")

if __name__ == "__main__":
    test_user_flow()
