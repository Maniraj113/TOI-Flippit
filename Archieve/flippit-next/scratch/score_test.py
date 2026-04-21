import requests
import json

URL_SAVE = "https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com/save-game"
URL_USER = "https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com/user/9f76794c-b502-4101-9acc-afa693c5682f"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoYXNoX2lkIjoiOWY3Njc5NGMtYjUwMi00MTAxLTlhY2MtYWZhNjkzYzU2ODJmIiwiaWF0IjoxNzc2NTI2MTIzLCJleHAiOjE4MDgwNjIxMjN9.ZYiWgHtuVCID851--I_UYdp7GjM3D1u-YHYNrDcuwTQ"

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {TOKEN}"
}

print("--- RUNNING HIGH SCORE TEST ---")
data = {"g_id": "eec36aba", "user_id": 30, "city": "TOIIN", "time_taken": 30, "score": 99, "status": "completed"}
r = requests.post(URL_SAVE, headers=HEADERS, json=data)
print(f"Score 99 Response: {r.text}")

print("\n--- CHECKING GAME HISTORY ---")
r_user = requests.get(URL_USER, headers=HEADERS)
print(f"User History: {r_user.text[:500]}...")
