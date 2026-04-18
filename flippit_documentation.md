# Flippit (TOI Game) - Application Documentation

## 1. Executive Summary
Flippit is a high-engagement, branded digital game experience for **The Times of India (TOI)**. Users enter the game via a QR code in the physical newspaper, leading to a mobile-first web app that integrates with AmuseLabs' gaming engine. The goal is to solve the puzzle within 60 seconds, share scores with friends, and maintain a daily streak.

---

## 2. Application Journey (User Flow)

### Phase 1: Entry & Awareness
- **QR Entry**: User scans a QR code in the TOI newspaper.
- **Landing Page**: User lands on the Splash Screen.
- **Session Check**:
  - If a session (name + token) exists in `localStorage`, the user is greeted and can click **"LET'S START"** to go directly to the **Game Page**.
  - If no session exists, the user is directed to the **Login Phase**.

### Phase 2: Authentication (New Users)
- **Mobile Input**: User enters a 10-digit mobile number.
- **OTP Delivery**: App sends an OTP via a bridge API.
- **OTP Verification**:
  - User enters the 6-digit code.
  - **Auto-fill**: (Planned) Using `autocomplete="one-time-code"` for one-click entry on mobile.
- **Identity Check**:
  - If the user is found in the system (Existing User), they proceed to the **Game Page**.
  - If not found (New User), they are prompted to enter their **Name** before starting.
- **Daily Lock Implementation**: After OTP verification, if the system detects the user has already played for the day, they should be redirected to the **Result Page** instead of the game, even if in Incognito.

### Phase 3: The Game
- **Puzzle Loading**: The game (via AmuseLabs iframe) loads.
- **Countdown**: A 60-second timer starts as soon as the puzzle is ready.
- **Engagement**: User interacts with the custom "Flippit" board.
- **Completion**: Score is calculated based on performance and remaining time.

### Phase 4: Results & Sharing
- **Result Screen**: Displays Solve Time, Score, Total Flips, Win Rate, and Streaks.
- **Trophy Card**: A high-resolution shareable image (1080x1080) is generated using `html2canvas`.
- **Sharing**: Native mobile sharing allows users to post their results on WhatsApp, Instagram, or download the image.

---

## 3. API Reference

### Internal Bridge APIs (Next.js Routes)
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/otp/send` | `POST` | Triggers OTP delivery to the provided mobile number. |
| `/api/otp/verify` | `POST` | Validates the OTP and returns `UserId`, `UserName`, and `Token`. |

### Backend API (AWS Gateway)
| Endpoint | Method | Authorization | Purpose |
| :--- | :--- | :--- | :--- |
| `/verify-otp` | `POST` | None | Core verification logic (called by the internal bridge). |
| `/save-user` | `POST` | Bearer Token | Updates the user's profile Display Name. |
| `/save-game` | `POST` | Bearer Token | Persists game results (Score, Time, City/Location). |
| `/user/{userId}` | `GET` | None | Retrieves user game logs and lifetime statistics. |

---

## 4. Business Rules & Logic

### 1. Game Ranking System
Based on the final score, the user is assigned a rank:
- **GOLD**: Score ≥ 80
- **SILVER**: Score ≥ 50
- **BRONZE**: Score < 50

### 2. Win Rate Calculation
The win rate is a performance metric calculated relative to the time spent:
- `WinRate = 100 - (TimeSpent / 60) * 10` (clamped at 100%).

### 3. Quick Result / High Performance
If a user solves the puzzle extremely fast (e.g., < 15s), the UI should prioritize celebratory feedback and "Gold" ranking animations.

### 4. Session Persistence
Sessions are stored in `localStorage`. If a user clears their cache or uses Incognito, the OTP verification step acts as the source of truth for retrieving their existing history.

---

## 5. Identified UX Improvements & Support Reduction

To ensure a "World Class" experience and minimize support queries, the following improvements are recommended:

1. **OTP Autofill (Critical)**:
   - Add `autocomplete="one-time-code"` to the OTP input.
   - Implement the **WebOTP API** so the browser automatically detects the SMS and offers a "Paste" button.

2. **Google Analytics & Location**:
   - Integrate `gtag.js` or `react-ga4`.
   - Use the Geolocation API (with user permission) or an IP-to-Location service to capture the user's City (Delhi, Mumbai, etc.) for localized leaderboards.

3. **Visual Feedback**:
   - **Loading States**: Add a skeleton loader for the AmuseLabs iframe to prevent a "white flash" while the game loads.
   - **Haptic Feedback**: Add subtle vibrations on mobile when letters are flipped or when the timer hits its last 5 seconds.

4. **Support Buffering**:
   - **"Help" Floating Button**: A small bubble leading to a "Rules" modal to avoid frustration.
   - **Error Handling**: Clearer error messages (e.g., "Invalid OTP. Please wait 30s to resend").

---

## 6. Important Missing Points & Recommendations

- **Environment Consistency**: Ensure `BASE_URL` is managed via `.env` variables (Development vs. Production).
- **Security**: Implement Rate Limiting on the OTP endpoints to prevent SMS flooding/abuse.
- **Cache Management**: The sharing image (`TrophyCard`) is currently hidden with `-9999` positioning. For better performance, it should only be rendered to the DOM when the "Share" button is clicked.
- **PWA Support**: Converting the app to a Progressive Web App (PWA) would allow users to "Install" it, improving retention and daily play.

---

## 7. Comprehensive Application Logic & State Scenarios

To maintain a robust user experience, the system handles the following scenarios dynamically:

### Scenario A: New User (First Time Entry)
- **Path**: `Splash` -> `Login` -> `OTP` -> `Register` -> `Game` -> `Result`
- **Result**: New entry created in DB; session (ID, Token, Name) stored in `localStorage`.

### Scenario B: Returning User (Next Day)
- **Path**: `Splash` -> `Session Check` -> `Game` -> `Result`
- **Condition**: `localStorage` has name/token, and server confirms no game played *today*.

### Scenario C: Returning User (Already Played Today - Local Session)
- **Path**: `Splash` -> `LET'S START` -> `Daily Lock Check` -> **FORCED REDIRECT** -> `Result`
- **Logic**: Even if the user has a valid session, the system calls `getUserStats` on splash click. If a "completed" log exists for the current date in **IST (Asia/Kolkata)**, the user is sent straight to the results of their previous session.

### Scenario D: Returning User (Already Played Today - Clear Cache/Incognito)
- **Path**: `Splash` -> `Login` -> `OTP` -> `Daily Lock Check` -> **FORCED REDIRECT** -> `Result`
- **Logic**: After OTP verification, the server returns the player's history. If a "completed" game is found for the current date in **IST (Asia/Kolkata)**, the app reconstructs the `scoreData` from the server and bypasses both Registration and Gameplay.

### Scenario E: Unregistered Auth (Verified but no Name)
- **Path**: `Splash` -> `Login` -> `OTP` -> `Register` -> `Game` -> `Result`
- **Logic**: If `res.UserName` is null or "Test" after OTP, the user is forced into the `Register` screen before they can access the iframe.

### Scenario F: Puzzle Expiry during Session
- **Path**: `Game Screen` -> `Iframe Load` -> `Expired Message` -> `Expired Screen`
- **Logic**: If the AmuseLabs iframe emits a `PUZZLE_EXPIRED` event or the timer hits a safety threshold, the user is moved to a dedicated "Expired" state to prevent scoring on stale data.

### Scenario G: Incomplete Registration Flow
- **Path**: `Register` -> `Refresh`
- **Logic**: Since the session (ID/Token) is saved *before* the name, a refresh on the Registration screen will correctly keep the user on the Registration screen (instead of resetting to Login).

---
