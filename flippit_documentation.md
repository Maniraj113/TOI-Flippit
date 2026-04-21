# Flippit (TOI Game) - Application Documentation

## 1. Executive Summary
Flippit is a high-engagement, branded digital game experience for **The Times of India (TOI)**. Users enter the game via a QR code in the physical newspaper, leading to a mobile-first web app that integrates with AmuseLabs' gaming engine. The goal is to solve the puzzle within 60 seconds, share scores with friends, and maintain a daily streak.

---

## 2. Application Journey (User Flow)

### Phase 1: Entry & Awareness
- **QR Entry**: User scans a QR code in the TOI newspaper.
- **URL Parameters**: The URL contains `city` (or `c`) and `date` (or `d`).
- **Date Check**: The app validates the `date` parameter against the current **IST (Asia/Kolkata)** date. If they don't match, the user is shown an "Expired QR" screen.
- **Landing Page**: User lands on the Splash Screen.
- **Session Check**:
  - If a session (id + token + name) exists in `localStorage`, the user clicks **"LET'S START"**, triggering a `checkDailyLock`.
  - If no session exists, the user is directed to the **Login Phase**.

### Phase 2: Authentication (New/Expired Session)
- **Mobile Input**: User enters a 10-digit mobile number.
- **OTP Delivery**: App sends an OTP via the `/send-otp` bridge API.
- **OTP Verification**:
  - User enters the 6-digit code.
  - **Auto-verify**: Verification triggers automatically once the 6th digit is entered.
  - **Resend**: A 30-second cooldown timer prevents OTP flooding.
- **Identity Check**:
  - If `FirstTimeUser` is true or `UserName` is missing, users proceed to the **Registration Screen**.
  - Otherwise, they proceed to `checkDailyLock`.

### Phase 3: The Game & Daily Lock
- **Daily Lock**: The app calls `getUserStats`.
  - If a "completed" game is found for today, the user is moved directly to the **Result Screen**.
  - If a "pending" game is found and is < 60 seconds old, the game resumes.
  - If a "pending" game is > 60 seconds old, or an "expired" log exists, the user is moved to the **Expired Screen**.
- **Puzzle Loading**: The game (via AmuseLabs iframe) loads. A `PUZZLE_LOAD` event captures the dynamic `puzzleId`.
- **Countdown**: A 60-second timer starts. The badge pulses and turns red in the last few seconds.
- **Completion**: Score is calculated based on performance and remaining time.

### Phase 4: Results & Sharing
- **Result Screen**: Displays "Mission Accomplished!" (or similar based on speed), Solved Time, and Score.
- **Expired/Timeout Screen**: A dedicated screen with an alarm clock icon and a "Sad Face" badge for users who ran out of time or used an old QR.
- **Trophy Card**: A high-fidelity shareable image generated using `html2canvas` on a hidden vertical card layout.
- **Sharing**: Native mobile sharing for WhatsApp, Instagram, etc.

---

## 3. API Reference (AWS Gateway)

**Base URL:** `https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com`

| Endpoint | Method | Params / Body | Purpose |
| :--- | :--- | :--- | :--- |
| `/send-otp` | `POST` | `{ "phone": "10-digits" }` | Sends OTP to the device. |
| `/verify-otp` | `POST` | `{ "phone", "otp" }` | Returns `UserId`, `UserName`, `token`, `FirstTimeUser`. |
| `/save-user` | `POST` | `{ "user_name" }` | Updates the user's display name (Bearer auth). |
| `/save-game` | `POST` | `{ "g_id", "status", "score", "time_taken", "city" }` | Logs game state (pending/completed/expired). |
| `/user/{userId}`| `GET` | Headers: `Authorization` | Retrieves user game logs and lifetime statistics. |

---

## 4. Business Rules & Logic

### 1. Typography (Design System)
The application uses a unified font system: **Gotham** (local). Fallback is **Inter**. All headers and body text use this system to ensure a premium, branded feel.

### 2. Time-Based Messaging
The success message on the result page varies by solve time:
- **1–20s**: "Fastest fingers in town!"
- **21–35s**: "You're on fire!"
- **36–50s**: "You crushed it!"
- **51–60s**: "Mission accomplished!"

### 3. Expiry Messages
Randomized messages for timeout/expired states (e.g., "Oops! This flip flopped. Try again tomorrow...").

### 4. Dynamic Game ID
Captured from the `PUZZLE_LOAD` iframe message (`event.data.id`) ensures accurate tracking across different daily puzzles.

### 5. Test Mode
Enabled via `?test=true`. It bypasses the daily lock and date validation, displaying a red "TEST MODE ACTIVATED" banner.

---

## 5. UI Components & UX

- **Pill Stats**: Statistics on the result and trophy card are presented in split-pill layouts (Left: Label/Icon, Right: Value) with high-contrast brown backgrounds.
- **Trophy Card Aesthetics**: High-fidelity, vertical orientation (600x700 viewport) featuring auto-scaling for player names to ensure single-line fits.
- **Mobile responsiveness**: Inputs are constrained (max-width 240px for mobile input) for better focus and 1-tap interaction.

---

## 6. Comprehensive State Scenarios

- **Scenario A (New)**: `Splash` -> `Login` -> `OTP` -> `Register` -> `Game` -> `Result`
- **Scenario B (Returning)**: `Splash` -> `Game` (if no game today)
- **Scenario C (Locked)**: `Splash` -> `Result` (if already played today)
- **Scenario D (Expired)**: `Splash` -> `Expired Screen` (if QR is old or user timed out previously)
- **Scenario E (Timeout)**: `Game` -> `Timer hits 0` -> `Expired Screen`

---

*Documentation Version: 3.0 | Updated April 2026 based on Production codebase.*
