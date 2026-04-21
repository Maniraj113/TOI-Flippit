import requests
import json

URL = "https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com/save-game"
# Token extracted from your latest terminal log
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoYXNoX2lkIjoiOWY3Njc5NGMtYjUwMi00MTAxLTlhY2MtYWZhNjkzYzU2ODJmIiwiaWF0IjoxNzc2NTI2MTIzLCJleHAiOjE4MDgwNjIxMjN9.ZYiWgHtuVCID851--I_UYdp7GjM3D1u-YHYNrDcuwTQ"

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {TOKEN}"
}

payloads = [
    {
        "name": "Test 1: String ID, Score 10, With City",
        "data": {"g_id": "eec36aba", "user_id": "30", "city": "TOIIN", "time_taken": 60, "score": 10, "status": "completed"}
    },
    {
        "name": "Test 2: Number ID, Score 10, With City",
        "data": {"g_id": "eec36aba", "user_id": 30, "city": "TOIIN", "time_taken": 60, "score": 10, "status": "completed"}
    },
    {
        "name": "Test 3: Number ID, Score 10, NO City",
        "data": {"g_id": "eec36aba", "user_id": 30, "time_taken": 60, "score": 10, "status": "completed"}
    }
]

print("--- STARTING LIVE PROBE ---")
for p in payloads:
    print(f"\nRunning {p['name']}...")
    try:
        r = requests.post(URL, headers=HEADERS, json=p['data'], timeout=10)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text}")
    except Exception as e:
        print(f"Error: {str(e)}")
print("\n--- PROBE COMPLETE ---")
