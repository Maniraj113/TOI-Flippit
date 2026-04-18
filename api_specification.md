# Flippit API Specification

This document details the API endpoints used by the Flippit Game. The application uses a hybrid approach:
1. **Next.js API Routes**: Act as proxies to handle CORS and hide backend complexity.
2. **AWS API Gateway**: The primary backend for data persistence and authentication.

---

## 1. Authentication APIs (Proxy)

### Send OTP
Generates and sends a 4-digit OTP to the user's mobile number via AWS SNS/Pinpoint.

- **Endpoint**: `POST /api/otp/send`
- **Request Body**:
  ```json
  {
    "phone": "9876543210"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "message": "OTP sent successfully",
    "requestId": "uuid"
  }
  ```
- **Response (Error)**:
  ```json
  {
    "error": "Failed to send OTP"
  }
  ```

### Verify OTP
Validates the OTP and returns user session details.

- **Endpoint**: `POST /api/otp/verify`
- **Request Body**:
  ```json
  {
    "phone": "9876543210",
    "otp": "1234"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "UserId": "user_123",
    "token": "jwt_auth_token",
    "FirstTimeUser": true
  }
  ```
- **Response (Invalid OTP)**:
  ```json
  {
    "message": "Invalid OTP",
    "status": "failure"
  }
  ```

---

## 2. User & Game Progress APIs (AWS Backend)

**Base URL**: `https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com`  
**Authorization**: All POST requests (except Verify) require clinical Bearer tokens: `Authorization: Bearer <token>`

### Save User Details
Registers the user's name after first-time login.

- **Endpoint**: `POST /save-user`
- **Request Body**:
  ```json
  {
    "user_name": "John Doe"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User saved successfully"
  }
  ```

### Save Game Result
Saves the score and metrics at the end of a game session.

- **Endpoint**: `POST /save-game`
- **Request Body**:
  ```json
  {
    "score": 85,
    "time_taken": 12,
    "status": "completed",
    "wrong_attempts": 3,
    "correct_matches": 8
  }
  ```
- **Response**:
  ```json
  {
    "message": "Game result saved",
    "game_id": "g_987"
  }
  ```

### Get User Stats (Daily Lock Check)
Retrieves the history of the user to determine if they have already played today.

- **Endpoint**: `GET /user/{userId}`
- **Response**:
  ```json
  {
    "data": {
      "user_id": "user_123",
      "user_name": "John Doe",
      "gameLogs": [
        {
          "g_id": "g_987",
          "score": 85,
          "time_taken": 12,
          "status": "completed",
          "created_at": "2026-04-18T10:00:00Z"
        }
      ]
    }
  }
  ```

---

## 3. Data Flow Diagram

1. **User enters Phone** -> Call `/api/otp/send`.
2. **User enters OTP** -> Call `/api/otp/verify`.
3. **If `FirstTimeUser`** -> Show Name Registration -> Call `/save-user`.
4. **Game Ends** -> Call `/save-game`.
5. **On Re-entry** -> Call `/user/{userId}` -> Check if `gameLogs` contains a `completed` entry for today's date in IST.
