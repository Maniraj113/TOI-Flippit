# Flippit Game: System Architecture & Handoff Guide

This document serves as the technical map for the **Flippit** game codebase (April/May 2026 version). It is designed to help the TOI application team understand the structure, logic, and recent stability improvements.

## 1. Architectural Philosophy
The codebase has been refactored from a monolithic script into a **Modular State-Driven Architecture**. 
- **State Object (`State`)**: The single source of truth for the current game session.
- **UI Object (`UI`)**: Handles all DOM manipulations and screen transitions.
- **GameEngine**: Encapsulates the lifecycle of a single game play.
- **GameBridge**: Manages communication with the AmuseLabs crossword iframe.

## 2. Key Modules & Logic Flow

### A. Timer Persistence (Critical Fix)
**Problem**: Page reloads were resetting the 60-second timer.
**Solution**:
- Found in `GameEngine.startTimer`.
- Uses `localStorage` (`flippedit_timer_v2`) to save `timeLeft` every 2 seconds.
- On initialization (`INITIALIZATION` block), the app checks if a saved timer exists for today's IST date.
- If found, it resumes exactly where the user left off.

### B. Session & Authentication
- **Storage**: Sessions are stored in `flippit_v2_session`.
- **Validation**: On load, the app checks for a valid session. If found, it performs a **"Warm-up"** load of the game iframe in the background to reduce perceived latency for the user.
- **OTP Manager**: Handles the 6-digit verification flow and resend countdown logic.

### C. Data Persistence & API Reliability
**Problem**: Intermittent save failures and 401 Unauthorized errors.
**Solution**:
- **Offline Queue (`OfflineManager`)**: If a network error occurs during `saveGame`, the results are queued in `localStorage`.
- **Smart Flush**: The app attempts to "flush" the queue whenever a new session is established.
- **401 Recovery**: If a queued item fails due to an expired token, it now attempts a retry with the *current* active token.
- **Enhanced Logging**: In test mode (`?test=true`), every API call logs the exact server response body to the console for easier backend debugging.

### D. QR Code & Access Control
**Logic**: Found in `Utils.initQueryParams`.
- **Mandatory Params**: Requires `city` (or `c`) and `date` (or `d`).
- **Validation**: Compares the scanned date against the current IST date.
- **Enforcement**: If parameters are missing or the date is from a previous day, the user is immediately redirected to the `screen-expired`.
- **URL Cleaning**: Successfully captures data and then removes params from the address bar for a premium UI feel.

## 3. "Why it Changed" (Response to TOI Team)
The legacy code used manual global variables and lacked error boundaries. The new structure provides:
1. **Traceability**: Every action is logged and error-handled.
2. **Resilience**: The game survives accidental reloads and network drops.
3. **Security**: Mandatory parameter checking prevents direct URL access.
4. **Maintenance**: Logic is decoupled (e.g., changing the Scoring formula in `calculateResults` does not break the Timer).

## 4. How to Test
1. **Normal Play**: Scann today's QR code.
2. **Persistence Test**: Start a game, wait 10 seconds, and refresh. The timer should resume at ~50s.
3. **Expiry Test**: Remove `?city=...` from the URL. You should see the "Access Denied" screen.
4. **Debug Mode**: Append `?test=true` to the URL. Open Chrome DevTools (Console) to see the full "Heartbeat" of the application logic.

---
*Prepared by Antigravity AI Coding Assistant*
