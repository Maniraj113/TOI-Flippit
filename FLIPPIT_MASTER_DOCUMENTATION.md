# TOI Flippit — Master Documentation
> **Version:** 3.0  |  **Date:** April 2026  |  **Status:** Production Reference

---

## TABLE OF CONTENTS
1. [Typography & Font Audit](#1-typography--font-audit)
2. [Button & Input Size Audit](#2-button--input-size-audit)
3. [API Reference (Production)](#3-api-reference-production)
4. [User Scenarios & State Machine](#4-user-scenarios--state-machine)
5. [Business-Approved Message Copy](#5-business-approved-message-copy)
6. [Result & Trophy Card Design](#6-result--trophy-card-design)
7. [QR Code & Date Strategy](#7-qr-code--date-strategy)
8. [Test Mode Design](#8-test-mode-design)
9. [Resolved Bugs & Production Fixes](#9-resolved-bugs--production-fixes)
10. [Implementation Status](#10-implementation-status)

---

## 1. Typography & Font Audit

### Fonts Currently in `index.html`

| Font Name | Source | Usage |
|---|---|---|
| **Gotham** | `./GothamBook_2.ttf` (local) | Primary font for EVERYTHING. Defined in CSS as `--font-heading`, `--font-body`, etc. |
| **Inter** | Google Fonts CDN | High-fidelity fallback for robust rendering. |

> [!IMPORTANT]
> The application has been simplified to use **Gotham** as the single source of truth for typography. Google Fonts (Outfit, Montserrat, Playfair) have been removed or set as secondary fallbacks to maintain brand integrity.

### Font Sizes (Production Standard)

| Element | Font Size | Weight |
|---|---|---|
| Main Tagline (Splash) | `14px` | 800 |
| Auth Heading (Inputs) | `18px` | 700 (Sub-text) |
| OTP Boxes | `24px` | 800 |
| Timer Value | `24px` | 900 |
| Result Message (Top) | `20px` | 800 |
| Stat Labels (Result/Card) | `16px` | 700 |
| Stat Values (Large) | `18px` / `22px` | 900 |
| Trophy Card Player Name | Dynamic | 900 (Auto-scaling) |

---

## 2. Button & Input Size Audit

### Buttons

| Button | CSS Width | Padding | Features |
|---|---|---|---|
| LET'S START (`#start-btn`) | min-width 160px | 12px 32px | Primary Brand Brown |
| GET OTP / VERIFY | 100% (max-width) | 12px 28px | Standardized Primary |
| SHARE (`#share-btn`) | auto | 8px 16px | White Pillar with Arrow |
| HOW TO PLAY (Link) | auto | none | Underlined, 12px |

### Inputs

| Input | Max-Width | Letter-Spacing | Focus State |
|---|---|---|---|
| `#mobile-input` | `240px` | `3px` | Brown Glow |
| `#otp-container` | (fixed gap) | N/A | Individual box focus |
| `#name-input` | `100%` | Normal | Standard |

---

## 3. API Reference (Production)

**Base URL:** `https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com`

### 3.1 `POST /send-otp`
- **Body:** `{ "phone": "9876543210" }`
- **Logic:** Triggers 30s cooldown in UI. Use for both initial login and resend.

### 3.2 `POST /verify-otp`
- **Body:** `{ "phone": "9876543210", "otp": "123456" }`
- **Response:** Returns `UserId`, `UserName`, `token`, `FirstTimeUser`.
- **Flow:** If `FirstTimeUser` is true, force Registration Screen.

### 3.3 `POST /save-game` (Primary Tracking)
- **Status: `pending`**: Fired on `PUZZLE_LOAD`. Captures dynamic `g_id`.
- **Status: `completed`**: Fired on `PUZZLE_COMPLETE`. Captures `score` and `time_taken`.
- **Status: `expired`**: Fired on timer hit 0 or safety threshold.
- **Payload:** `{ "g_id", "user_id", "status", "score", "time_taken", "city" }`

### 3.4 `GET /user/{userId}`
- **Usage:** Used in `checkDailyLock` to detect if the user has already played "completed" or "expired" games for the current IST date.

---

## 4. User Scenarios & State Machine

### The "Daily Lock" Logic
1. User clicks "Start".
2. App checks `getUserStats`.
3. If a `completed` game exists for today (IST): **Forced Redirect to Result Page**.
4. If a `pending` game exists:
    - Age > 60s: **Forced Redirect to Expired Screen**.
    - Age < 60s: **Resume Game**.
5. Otherwise: **Launch New Game**.

### Date Validation (QR Expiry)
- URL `date=` parameter (format `YYYYMMDD`) is converted to `YYYY-MM-DD`.
- Compared against `Utils.getISTDateString()`.
- Mismatch results in `screen-expired` with the "Older QR code" message.

---

## 5. Business-Approved Message Copy

### Success Messages (Based on Time)
- **1–20s**: "Fastest fingers in town!"
- **21–35s**: "You're on fire!"
- **36–50s**: "You crushed it!"
- **51–60s**: "Mission accomplished!"

### Random Completion Footers
- "Great flip! Another one lands tomorrow. Until then, enjoy the rest of today's TOI."
- "Well played! A fresh flip awaits tomorrow. For now, let's get back to today's TOI."
- (and 4 other variations)

---

## 6. Result & Trophy Card Design

### Simplified 2-Stat Layout
To ensure maximum impact and clarity, the Result Screen and Trophy Card now focus on Two Core Stats:
1. **⏱️ Solved in**: Real-time performance.
2. **⭐ Your Score**: Final point tally.

### The "Expired" Design (v8.0)
- **Primary Visual**: Neat circular clock SVG (vibrant brown).
- **Badge**: A minimalist "Sad Face" badge in the bottom-right corner of the clock.
- **Copy**: Randomized timeout messages (e.g., "The puzzle dodged you today...").

### Trophy Card Specs
- **Orientation**: Vertical (600x700 viewport).
- **Background**: Brand Red (#9d071c).
- **Card**: Salmon (#F17660) with 28px rounded corners.
- **Feature**: Auto-scaling font logic for the player's name to prevent overflow.

---

## 7. QR Code & Date Strategy
- Format: `?city=MUMBAI&date=YYYYMMDD`
- Shortform Support: `?c=MUM&d=YYYYMMDD`
- Date logic is strictly bound to **Asia/Kolkata** timezone to prevent early/late access across regions.

---

## 8. Test Mode Design
- URL Param: `?test=true`
- Visual: Red bottom banner.
- Capabilities: Bypasses daily lock and date validation. Bypasses registration for existing tokens.

---

## 9. Resolved Bugs & Production Fixes
1. **Clock Icon Regression**: Replaced generic bell icon with high-fidelity circular clock and sad badge.
2. **Font Consistency**: Removed all Google Font imports (Outfit/ Montserrat) to enforce 100% Gotham usage.
3. **Expiry Routing**: Fixed logic where expired users could still click "Start" — they are now routed directly to the "Time's Up" screen.
4. **Name Scaling**: Implemented JS-based scaling for the Trophy Card to keep long names on a single line.
5. **Dynamic Game ID**: Now captures `puzzleId` from `postMessage` data instead of hardcoded defaults.

---

## 10. Implementation Status

| Feature | Status |
|---|---|
| Gotham Font Integration | ✅ 100% |
| Unified Color Palette | ✅ 100% |
| QR Date Validation (IST) | ✅ 100% |
| Daily Lock (API Based) | ✅ 100% |
| Expiry UI v8.0 | ✅ 100% |
| 2-Stat Trophy Card | ✅ 100% |
| Test Mode | ✅ 100% |
| Resend OTP Handler | ✅ 100% |

---
*Compiled April 21, 2026 | Source Material: index.html (v3.0 Production ready)*
