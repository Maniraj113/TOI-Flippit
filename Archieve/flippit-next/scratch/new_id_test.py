import requests
import json

URL = "https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com/save-game"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoYXNoX2lkIjoiOWY3Njc5NGMtYjUwMi00MTAxLTlhY2MtYWZhNjkzYzU2ODJmIiwiaWF0IjoxNzc2NTI2MTIzLCJleHAiOjE4MDgwNjIxMjN9.ZYiWgHtuVCID851--I_UYdp7GjM3D1u-YHYNrDcuwTQ"

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {TOKEN}"
}

# Creating a UNIQUE ID for today
NEW_GID = "flippit_live_test_18_apr"

data = {
    "g_id": NEW_GID,
    "user_id": 30,
    "score": 100,
    "time_taken": 10,
    "status": "completed",
    "city": "TOIIN"
}

print(f"--- TESTING NEW ID: {NEW_GID} ---")
r = requests.post(URL, headers=HEADERS, json=data)
print(f"Response: {r.text}")
