import requests
import json
from datetime import datetime

USER_HASH_ID = "9f76794c-b502-4101-9acc-afa693c5682f"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoYXNoX2lkIjoiOWY3Njc5NGMtYjUwMi00MTAxLTlhY2MtYWZhNjkzYzU2ODJmIiwiaWF0IjoxNzc2NTI2MTIzLCJleHAiOjE4MDgwNjIxMjN9.ZYiWgHtuVCID851--I_UYdp7GjM3D1u-YHYNrDcuwTQ"
BASE_URL = "https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com"

def verify_fix():
    print(f"--- VERIFICATION START: {datetime.now()} ---")
    headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
    
    # 1. Save a game using the HASH ID explicitly
    test_gid = f"fix_verification_{int(datetime.now().timestamp())}"
    print(f"1. Saving game with HASH ID: {test_gid}")
    save_data = {
        "g_id": test_gid,
        "user_id": USER_HASH_ID,
        "score": 99,
        "time_taken": 5,
        "status": "completed"
    }
    r_save = requests.post(f"{BASE_URL}/save-game", headers=headers, json=save_data)
    print(f"Save Status: {r_save.status_code}")
    print(f"Save Response: {r_save.text}")
    
    # 2. Immediately fetch logs using the HASH ID
    print("\n2. Fetching logs with HASH ID...")
    r_fetch = requests.get(f"{BASE_URL}/user/{USER_HASH_ID}", headers=headers)
    print(f"Fetch Status: {r_fetch.status_code}")
    if r_fetch.status_code == 200:
        data = r_fetch.json()
        logs = data.get('gameLogs', data.get('data', {}).get('gameLogs', []))
        found = any(log.get('g_id') == test_gid for log in logs)
        if found:
            print("✅ SUCCESS: Log was found in the hash account!")
        else:
            print("❌ FAILURE: Log was not found in the hash account.")
    else:
        print(f"Fetch Error: {r_fetch.text}")

if __name__ == "__main__":
    verify_fix()
