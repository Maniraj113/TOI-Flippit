# Flippit: Technical Data Flow & API Documentation

This document outlines the technical scenarios, API payloads, and response structures for the Flippit web application.

---

## 1. Scenario: User Authentication (Login & OTP)

### 1a. Send OTP
Triggered when a user enters their 10-digit mobile number on the Login screen.

- **Endpoint:** `POST /api/v1/send-otp`
- **Request Payload:**
  ```json
  {
    "mobile": "9876543210",
    "project": "flippit"
  }
  ```
- **Expected Response:**
  ```json
  {
    "status": "success",
    "message": "OTP sent successfully"
  }
  ```

### 1b. Verify OTP
Triggered when the user enters the 6-digit code received via SMS.

- **Endpoint:** `POST /api/v1/verify-otp`
- **Request Payload:**
  ```json
  {
    "mobile": "9876543210",
    "otp": "123456"
  }
  ```
- **Exemplary Response:**
  ```json
  {
    "UserId": "1042",
    "UserName": "Raj Sharma",
    "token": "eyKjHbm..."
  }
  ```
- **Action:** The `token` is stored in `localStorage` and used in the `Authorization: Bearer` header for all subsequent calls.

---

## 2. Scenario: Session Restoration (Existing User Re-entry)

When a user returns to the app, we must check if they have already played today to prevent double-scoring.

### 2a. Fetch User Stats
- **Endpoint:** `GET /api/v1/get-user-stats?user_id=1042`
- **Headers:** `Authorization: Bearer <token>`
- **Exemplary Response:**
  ```json
  {
    "streak": 5,
    "gameLogs": [
      {
        "game_id": "30",
        "status": "completed",
        "score": 94,
        "created_at": "2026-04-22T08:00:00Z"
      }
    ]
  }
  ```
- **Logic:** If a log exists for today with status `completed` or `expired`, the app jumps directly to the **Results** screen.

---

## 3. Scenario: Gameplay Handshake (AmuseLabs)

### 3a. Launching the Iframe
The app launches the puzzle using the following URL structure:
- **URL:** `${CONFIG.PUZZLE_BASE}/?uid=${USER_ID}-${RANDOM_SEED}`
- **Note:** In Test Mode, a random seed is appended to force a puzzle reset.

### 3b. Receiving the Puzzle ID (Handshake)
- **Signal:** `postMessage` from Iframe to Parent.
- **Payload:**
  ```json
  {
    "type": "PUZZLE_LOAD",
    "id": "30"
  }
  ```
- **Action:** App stores `30` as the current `gameId`.

---

## 4. Scenario: Scoring & Submission

### 4a. Puzzle Completion
- **Signal:** `postMessage` from Iframe to Parent.
- **Payload:**
  ```json
  {
    "type": "SOLVE",
    "timeTaken": 12,
    "points": 40
  }
  ```
- **Local Calculation:**
  - `Time Bonus`: 59 - 12 = 47
  - `Accuracy Bonus`: 40
  - `Total Score`: 87

### 4b. Save Game Data
- **Endpoint:** `POST /api/v1/save-game`
- **Headers:** `Authorization: Bearer <token>`
- **Request Payload:**
  ```json
  {
    "g_id": "30",
    "user_id": 1042,
    "time_taken": 12,
    "score": 87,
    "status": "completed",
    "city": "CHN"
  }
  ```

---

## 5. Scenario: Game Expiry (Timeout)

Triggered when the 60s countdown reaches 0 before the AmuseLabs iframe sends a solve signal.

- **Action:** If time runs out, the app sends a "failure" payload to the backend.
- **Status Payload (save-game):**
  ```json
  {
    "g_id": "30",
    "user_id": 1042,
    "time_taken": 60,
    "score": 0,
    "status": "expired",
    "city": "CHN"
  }
  ```
- **Outcome:** The user sees the "Alarm Clock" expiry screen and is blocked from playing again until the next day.

---

## 6. Data Fallbacks (Safety Measures)

| Parameter | Source of Truth | Fallback |
| :--- | :--- | :--- |
| **Game ID** | AmuseLabs `PUZZLE_LOAD` | `CONFIG.GAME_ID_VAL` (30) |
| **User Name** | Registration Screen | "TOI Reader" |
| **City** | URL `?c=` or `?city=` | "TOIIN" (National) |
| **Date** | URL `?d=` or `?date=` | Today's Date (IST) |
