import requests
import json

URL_USER = "https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com/user/9f76794c-b502-4101-9acc-afa693c5682f"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoYXNoX2lkIjoiOWY3Njc5NGMtYjUwMi00MTAxLTlhY2MtYWZhNjkzYzU2ODJmIiwiaWF0IjoxNzc2NTI2MTIzLCJleHAiOjE4MDgwNjIxMjN9.ZYiWgHtuVCID851--I_UYdp7GjM3D1u-YHYNrDcuwTQ"

HEADERS = {"Authorization": f"Bearer {TOKEN}"}

print("--- FETCHING FULL HISTORY ---")
r_user = requests.get(URL_USER, headers=HEADERS)
data = r_user.json()
print(json.dumps(data, indent=2))
