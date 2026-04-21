import requests
import json

URL = "https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com/save-user"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoYXNoX2lkIjoiOWY3Njc5NGMtYjUwMi00MTAxLTlhY2MtYWZhNjkzYzU2ODJmIiwiaWF0IjoxNzc2NTI2MTIzLCJleHAiOjE4MDgwNjIxMjN9.ZYiWgHtuVCID851--I_UYdp7GjM3D1u-YHYNrDcuwTQ"

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {TOKEN}"
}

print("--- TOKEN HEALTH CHECK ---")
r = requests.post(URL, headers=HEADERS, json={"user_name": "Final Proof"})
print(f"Status: {r.status_code}")
print(f"Response: {r.text}")
