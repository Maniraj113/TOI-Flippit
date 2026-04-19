# Flippit API Specification

This document details the API endpoints used by the Flippit Game. The application uses a hybrid approach:
1. **Next.js API Routes**: Act as proxies to handle CORS and hide backend complexity.
2. **AWS API Gateway**: The primary backend for data persistence and authentication.

---

## 1. Authentication APIs (Proxy)

### Send OTP
- **Proxy Endpoint (Code)**: `POST /api/otp/send`
- **Backend URL**: `POST https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com/send-otp`
- **Request Body**:
  ```json
  { "phone": "9876543210" }
  ```

### Verify OTP
- **Proxy Endpoint (Code)**: `POST /api/otp/verify`
- **Backend URL**: `POST https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com/verify-otp`
- **Request Body**:
  ```json
  { "phone": "9876543210", "otp": "1234" }
  ```

---

## 2. User & Game Progress APIs (AWS Backend)

### Save User Details
- **Proxy Endpoint (Code)**: `POST /api/save-user`
- **Backend URL**: `POST https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com/save-user`
- **Authorization**: `Bearer <token>`
- **Request Body**:
  ```json
  { "user_name": "John Doe" }
  ```

### Save Game Result
- **Proxy Endpoint (Code)**: `POST /api/save-game`
- **Backend URL**: `POST https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com/save-game`
- **Authorization**: `Bearer <token>`
- **Request Body**:
  ```json
  {
    "user_id": 30,
    "g_id": "eec36aba",
    "city": "TOIIN",
    "score": 85,
    "time_taken": 45,
    "status": "completed"
  }
  ```

### Get User Stats (Daily Lock Check)
- **Proxy Endpoint (Code)**: `GET /api/user/{userId}`
- **Backend URL**: `GET https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com/user/{userId}`
- **Response Structure**:
  ```json
  {
    "user": {
      "id": 30,
      "user_name": "Maniraj Audit",
      "hash_id": "9f76794c-b502-4101-9acc-afa693c5682f",
      ...
    },
    "gameLogs": [ ... ]
  }
  ```

---

## 3. Data Flow Diagram

1. **User enters Phone** -> Call `/api/otp/send`.
2. **User enters OTP** -> Call `/api/otp/verify`.
3. **If `FirstTimeUser`** -> Show Name Registration -> Call `/save-user`.
4. **Game Ends** -> Call `/save-game`.
5. **On Re-entry** -> Call `/user/{userId}` -> Check if `gameLogs` contains a `completed` entry for today's date in IST.
