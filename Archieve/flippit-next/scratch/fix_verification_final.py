import requests
import json
from datetime import datetime

USER_HASH_ID = "9f76794c-b502-4101-9acc-afa693c5682f"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoYXNoX2lkIjoiOWY3Njc5NGMtYjUwMi00MTAxLTlhY2MtYWZhNjkzYzU2ODJmIiwiaWF0IjoxNzc2NTI2MTIzLCJleHAiOjE4MDgwNjIxMjN9.ZYiWgHtuVCID851--I_UYdp7GjM3D1u-YHYNrDcuwTQ"
BASE_URL = "https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com"

def verify_fix():
    print(f"--- VERIFICATION (NO EMOJI): {datetime.now()} ---")
    headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
    
    # Check Logs
    r_fetch = requests.get(f"{BASE_URL}/user/{USER_HASH_ID}", headers=headers)
    if r_fetch.status_code == 200:
        data = r_fetch.json()
        logs = data.get('gameLogs', data.get('data', {}).get('gameLogs', []))
        print(f"Current Raw Logs for Hash ID:")
        for log in logs:
            print(f"  - {log.get('g_id')} (Created: {log.get('created_at')})")
        
        # Look for the verification entries
        verification_logs = [l for l in logs if "verification" in str(l.get('g_id'))]
        if verification_logs:
            print(f"SUCCESS: Found {len(verification_logs)} verification logs!")
        else:
            print("FAILURE: Verification log not found.")
    else:
        print(f"Fetch Error: {r_fetch.text}")

if __name__ == "__main__":
    verify_fix()
