import requests
import json

URL = "https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com/save-game"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoYXNoX2lkIjoiOWY3Njc5NGMtYjUwMi00MTAxLTlhY2MtYWZhNjkzYzU2ODJmIiwiaWF0IjoxNzc2NTI2MTIzLCJleHAiOjE4MDgwNjIxMjN9.ZYiWgHtuVCID851--I_UYdp7GjM3D1u-YHYNrDcuwTQ"

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {TOKEN}"
}

HASH_ID = "9f76794c-b502-4101-9acc-afa693c5682f"
NUM_ID = 30

tests = [
    {"name": "Legacy Strict (Num ID, No City)", "data": {"g_id": "eec36aba", "user_id": NUM_ID, "score": 99, "status": "completed", "time_taken": 30}},
    {"name": "Hash ID Variant", "data": {"g_id": "eec36aba", "user_id": HASH_ID, "score": 99, "status": "completed", "time_taken": 30}},
    {"name": "Status 'solved' Variant", "data": {"g_id": "eec36aba", "user_id": NUM_ID, "score": 99, "status": "solved", "time_taken": 30}},
    {"name": "Score as String", "data": {"g_id": "eec36aba", "user_id": NUM_ID, "score": "99", "status": "completed", "time_taken": 30}},
    {"name": "Keys as CamelCase (Legacy Check)", "data": {"g_id": "eec36aba", "userId": NUM_ID, "score": 99, "status": "completed", "timeTaken": 30}},
    {"name": "Everything Stringified", "data": {"g_id": "eec36aba", "user_id": str(NUM_ID), "score": "99", "status": "completed", "time_taken": "30"}}
]

print("--- EXHAUSTIVE PROBE ---")
for t in tests:
    print(f"\n{t['name']}...")
    r = requests.post(URL, headers=HEADERS, json=t['data'])
    print(f"Result: {r.text}")
