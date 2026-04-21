# Technical Q&A: Flippit Production Readiness

## 1. Core Logic & URL Parameter Handling

| Question | Answer |
| :--- | :--- |
| **Why does the game work without `d` or `c`?** | The app is built with **"Fail-Safe Fallbacks"**. If the parameters are missing, the system defaults to: <br>• **City:** `TOIIN` (Default National tracking). <br>• **Date:** Today's IST date. <br>This ensures the user never sees a blank screen, even if the QR code is malformed. |
| **How does Date Expiry really work?** | When the app starts, it checks the `?d=YYYYMMDD` parameter. If that date does **not** match today's date in IST, it triggers the "Expired" screen. If the parameter is missing entirely, it assumes today's date to allow the user to play. |
| **What is the "Clean URL" feature?** | To ensure the user doesn't see long tracking parameters (like `?c=MUM&d=20260421`) in their address bar, we use `history.replaceState`. This **masks** the URL immediately after the data is captured, leaving only a "clean" address (e.g., `flippit.com/`) visible. |
| **How is Game ID managed?** | We use a **postMessage Listener**. When the AmuseLabs iframe loads, it sends a `PUZZLE_LOAD` event. Our code listens for this and extracts the `puzzleId`. If for any reason AmuseLabs fails to send the ID, we use a **Hardcoded Fallback (30)** to ensure the score can still be saved. |
| **How are Console Logs cleared?** | We use a **Console Silencer (IIFE)** at the very top of the script. It globally overrides `console.log`, `.info`, and `.debug` with empty functions (`noop`). This mutes all logging in one shot, preventing users from seeing internal data flows in the browser inspector. |

---

## 2. Technical Implementation Details

### URL Parameter Logic (Deep Dive)
The `initQueryParams` function extracts tracking data:
1. `c` or `city`: Used for localized performance tracking.
2. `d` or `date`: Used to cross-reference against the IST clock for QR code validity.
3. **Clean-Up:** Once extracted, the `Clean URL` logic runs:
   ```javascript
   window.history.replaceState({}, document.title, window.location.pathname);
   ```
   This removes the "ugly" parameters from the browser bar while keeping them active in the game's internal memory (`State` object).

### Game ID & Data Linkage
1. **Reception:** `window.addEventListener('message', ...)` reacts to `PUZZLE_LOAD`.
2. **Storage:** `State.gameId` is updated with the ID received from AmuseLabs.
3. **Transmission:** When `save-game` API is called, it sends `game_id: State.gameId`.
4. **Linking:** The backend uses `user_id` (from verify-otp) and `game_id` to create a unique record of the play.

### Scoring Formula (Production Standard)
The formula is fixed at: **`(59 - time_taken) + min(40, amuseScore)`**.
*   **Time Bonus:** Starts at 59 points and drops by 1 per second.
*   **Accuracy Bonus:** Capped at 40 points based on AmuseLabs performance metrics.
*   **Max Possible Score:** 99.

---

## 3. High-Priority Ask for AmuseLabs Team
1. **Parameter Stability:** "Can you confirm that the `id` field in the `PUZZLE_LOAD` message will never be renamed?"
2. **Timing Accuracy:** "At what exact millisecond does your internal `timeTaken` counter start/stop?"
3. **Failover:** "What is the behavior if the puzzle payload fails to load? Will you fire an `error` message we can catch?"
