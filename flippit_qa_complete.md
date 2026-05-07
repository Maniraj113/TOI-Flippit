# Flippit – Complete QA & Scenario Validation Guide
**TOI Flippit | Pre-Go-Live Checklist | Version: Production**

---

## PART 1: SCREENS INVENTORY

The app has **7 screens** + **2 overlays** + **1 off-screen element**:

| ID | Screen | When Shown |
|----|--------|------------|
| `screen-splash` | Splash / Home | Default on load (valid link) |
| `screen-login` | Mobile Number Entry | New user or no session |
| `screen-otp` | OTP Verification | After OTP is sent |
| `screen-register` | Name Entry | First-time user (no username yet) |
| `screen-game` | Game (iframe) | After auth + lock check passes |
| `screen-result` | Results | After game completes |
| `screen-expired` | Expired / Access Denied | Invalid link OR timer ran out |
| `#how-overlay` | How to Play (modal) | Tapping "HOW TO PLAY" |
| `#loading-overlay` | Global spinner | During any async API call |
| `#capture-card` | Trophy card (hidden) | Off-screen; used for share image |

---

## PART 2: ALL USER SCENARIOS

### SCENARIO GROUP A — URL / LINK ACCESS CONTROL

---

**A1 — Direct URL access (no parameters)**
- Condition: User visits URL with no `?code=` or `?date=` params
- Expected: `screen-expired` shown with message: *"Access Denied — This game can only be accessed by scanning the QR code in today's edition of The Times of India."*
- Logic: `initQueryParams()` → `hasParams = false` → `isValid = false` → `expiryReason = 'missing_params'`
- Test: Open URL directly in browser without any query params

---

**A2 — Old / past date QR code scanned**
- Condition: User scans a QR from yesterday's or older newspaper (`?date=20260504&code=TOIIN`)
- Expected: `screen-expired` shown with message: *"Link Expired — Looks like you scanned an older QR code."*
- Logic: `normalizedDate < todayIST` → `expiryReason = 'date_expired'`
- Test: Manually construct URL with a past date and open it

---

**A3 — Future date QR code**
- Condition: `?date=20261231&code=TOIIN` — date is in the future
- Expected: `screen-expired` shown (same "Link Expired" message as A2)
- Logic: `normalizedDate > todayIST` → `expiryReason = 'future_link'` (same expired screen)
- Test: Manually construct URL with a future date

---

**A4 — Valid date but missing `code` parameter**
- Condition: `?date=20260506` (no `code=`)
- Expected: `screen-expired` with "Access Denied" message
- Logic: `codeParam` is null → `expiryReason = 'missing_params'`
- Test: URL with only `?date=` param

---

**A5 — Valid code but missing `date` parameter**
- Condition: `?code=TOIIN` (no `date=`)
- Expected: `screen-expired` with "Access Denied" message
- Test: URL with only `?code=` param

---

**A6 — Valid QR scan (today's date, correct code)**
- Condition: `?code=TOIIN&date=20260506` where date = today IST
- Expected: Splash screen loads normally
- Test: Use valid URL with today's date in YYYYMMDD format

---

**A7 — Short param aliases work**
- Condition: `?c=TOIIN&d=20260506` (short form params)
- Expected: Treated identically to full params
- Logic: `params.get('code') || params.get('c')` — both aliases are checked
- Test: Use short param names

---

**A8 — URL is cleaned after load**
- Condition: Any valid URL with params
- Expected: After load, URL bar shows clean URL without query params (no `?code=...`)
- Logic: `window.history.replaceState()` clears params
- Test: Check address bar after splash loads

---

### SCENARIO GROUP B — AUTHENTICATION FLOW

---

**B1 — Returning user with saved session (straight to game or results)**
- Condition: User already logged in previously; `flippit_v2_session` exists in localStorage with valid `id` (not `test-*`)
- Expected: Splash → tap "LET'S START" → checkDailyLock runs → either game or results (no login required)
- Test: Login once, close, reopen with valid link

---

**B2 — New user, no session (goes to login)**
- Condition: No session in localStorage
- Expected: Splash → "LET'S START" → `screen-login`
- Test: Clear localStorage and open with valid link

---

**B3 — Enter mobile, get OTP**
- Condition: User on login screen enters valid 10-digit number and taps "GET OTP"
- Expected: `sendOtp` API called → `screen-otp` shown → OTP timer starts (30s countdown) → first OTP box focused
- Validation: Number must be exactly 10 digits; non-numeric stripped
- Test: Enter valid number and submit

---

**B4 — Enter less than 10 digits**
- Condition: User enters 8-digit number and taps "GET OTP"
- Expected: `alert('Enter 10-digit number')` shown; no API call
- Test: Enter 8 digits and try to submit

---

**B5 — OTP entry — all 6 boxes**
- Condition: User fills all 6 OTP boxes
- Expected: Auto-verifies (triggers `verify-otp-btn.click()` automatically)
- Test: Manually enter all 6 digits

---

**B6 — OTP Paste support**
- Condition: User pastes a 6-digit OTP from SMS
- Expected: Digits fill all boxes; auto-verify triggered
- Test: Paste a 6-character string into first OTP box

---

**B7 — Wrong OTP entered**
- Condition: User enters incorrect OTP
- Expected: `verifyOtp` returns error → `alert('Verification Failed: ...')` shown → user stays on OTP screen
- Test: Enter wrong 6-digit OTP

---

**B8 — OTP Resend flow**
- Condition: 30s countdown completes → "RESEND OTP" button appears → user taps it
- Expected: `sendOtp` called again → countdown restarts → button hides again
- Test: Wait 30s on OTP screen, tap Resend

---

**B9 — Edit mobile number (go back)**
- Condition: User taps pencil/edit icon on OTP screen
- Expected: Returns to `screen-login`; phone field retains entered number
- Test: Enter number, go to OTP screen, tap edit

---

**B10 — First-time user (no username or username is "Test")**
- Condition: OTP verified → API returns `UserName = ''` or `UserName = 'Test'`
- Expected: Goes to `screen-register`
- Test: New mobile number flow

---

**B11 — Returning user with name already set**
- Condition: OTP verified → `UserName` is a real name (not blank/Test)
- Expected: Skips register → `checkDailyLock` → game or results
- Test: Login with a previously registered number

---

**B12 — Name registration (minimum length)**
- Condition: User on register screen enters name < 3 characters
- Expected: `alert('Name too short')` — no API call
- Test: Enter "Ab" and tap "START PLAYING"

---

**B13 — Name registration success**
- Condition: Name ≥ 3 chars entered and submitted
- Expected: `saveUser` API called → session saved → `checkDailyLock` → game or results
- Test: Enter valid name and submit

---

**B14 — Session with `test-` prefix ID is rejected**
- Condition: localStorage has session where `id` starts with `test-`
- Expected: Session cleared automatically; user treated as new
- Logic: `session.load()` → `String(data.id).startsWith('test-')` → removed
- Test: Manually set `flippit_v2_session` with id `test-123` in localStorage

---

**B15 — Unauthorized (401) during checkDailyLock**
- Condition: Token expired or invalid → getUserStats returns 401
- Expected: localStorage session cleared → page reloads (forces re-login)
- Test: Manually corrupt token in localStorage

---

### SCENARIO GROUP C — DAILY LOCK (PLAYED / NOT PLAYED)

---

**C1 — User has NOT played today (fresh game)**
- Condition: `getUserStats` returns no log with today's IST date and final status
- Expected: `onAvailable()` → `GameBridge.launch()` → game loads
- Test: Fresh user; log should show no today's entry

---

**C2 — User has COMPLETED today's game**
- Condition: Log exists with `status = 'completed'` and today's IST date
- Expected: `onLocked()` → results screen shown with their stored time/score
- Test: Complete a game, close, reopen with valid link

---

**C3 — User's game EXPIRED (timer ran out)**
- Condition: Log exists with `status = 'expired'` and today's IST date
- Expected: `onLocked()` → `screen-expired` shown (NOT results)
- Logic: `log.status === 'expired'` → `redirectAway('expired')`
- Test: Let timer run to 0, reopen with valid link

---

**C4 — Pending game < 60 seconds old (crash recovery)**
- Condition: Log with `status = 'pending'` exists from today, age < 60s
- Expected: `onAvailable()` — user allowed to continue (treated as fresh)
- Logic: Pending < 60s → "fresh pending session, allowing continue"
- Test: Start game, crash immediately (within 60s), reopen

---

**C5 — Pending game > 60 seconds old (stale / abandoned)**
- Condition: Pending log from today, age > 60s
- Expected: Treated as expired — `saveGame` with status `expired` → `screen-expired`
- Logic: `ageMs > 60000` → `todayLog = { ...pendingLog, status: 'expired' }` → `onLocked()`
- Test: Start game, abandon for >60s without completing, reopen

---

**C6 — API failure during lock check (network error)**
- Condition: `getUserStats` throws a network error (not 401)
- Expected: Fail-open → `onAvailable()` → user allowed to play
- Logic: `catch → onAvailable()` (avoid locking out on network issues)
- Test: Disable network after login, try to start game

---

### SCENARIO GROUP D — GAME LOADING & IFRAME

---

**D1 — Warm-up (pre-loading iframe in background)**
- Condition: Returning user detected on init → `GameBridge.warmUp()` called immediately
- Expected: `game-frame.src` is set in background before user taps "LET'S START"
- Logic: `initSaved` exists → `GameBridge.warmUp()`
- Test: Returning user — observe game loads faster

---

**D2 — Game iframe loads successfully (LOAD event)**
- Condition: AmuseLabs iframe fires a `postMessage` with type containing `'LOAD'`
- Expected: `isGameWarm = true`, `gameId` captured, pending save triggered, lock check runs, overlay hidden
- Test: Open game as valid new user and observe iframe loading

---

**D3 — Iframe takes > 15 seconds to load**
- Condition: `game-frame` src set but LOAD event not received within 15s
- Expected: `#iframe-timeout-msg` becomes visible with a warning message
- **BUG FOUND**: `#iframe-timeout-msg` element is NOT present in HTML. The JS references it but it's missing from the DOM. The timeout warning will silently fail.
- Fix needed: Add `<p id="iframe-timeout-msg">Taking longer than expected... please check your connection.</p>` inside `#iframe-loading-overlay`

---

**D4 — Game iframe READY/START signal received**
- Condition: AmuseLabs iframe fires postMessage with type `'READY'` or `'START'`
- Expected: `isPuzzleReady = true`, timer STARTS from `CONFIG.MAX_TIME = 60s`
- This is the TRUE timer start point. Timer does NOT start on LOAD.
- Test: Monitor postMessages from iframe in console (use `?test=true` param)

---

**D5 — LOAD received but no READY signal (fallback)**
- Condition: LOAD fires but READY/START never arrives from iframe
- Expected: 3-second fallback timer kicks in → `GameEngine.startTimer()` called
- Logic: `State.fallbackTimerHandle = setTimeout(..., 3000)`
- Test: Cannot easily test without modifying iframe; observe in edge cases

---

**D6 — Double timer prevention**
- Condition: READY signal fires while timer is already running
- Expected: Second `startTimer()` call is ignored (`if (State.timer) return`)
- Test: Simulated by sending multiple READY messages

---

**D7 — "PLAYING AS:" bar — name not populated**
- Condition: Game screen is shown
- Expected: Shows `PLAYING AS: [PlayerName]`
- **BUG FOUND**: `id="playing-as-name"` span is never set in JavaScript anywhere in the code. It will always show blank.
- Fix needed: Add `document.getElementById('playing-as-name').textContent = State.userName` in `UI.showScreen` when `name === 'game'`

---

**D8 — `game-container` element missing from HTML**
- Condition: LOAD event fires → JS tries `document.getElementById('game-container').style.opacity`
- Expected: Sets opacity to 0 (hiding game) then 1 (showing)
- **BUG FOUND**: `id="game-container"` does NOT exist in HTML. The element is `game-iframe-wrap`. This will throw a `TypeError: Cannot set properties of null` and crash the LOAD handler silently.
- Fix needed: Either add `id="game-container"` to `div.game-iframe-wrap` or change JS references to `game-iframe-wrap`

---

### SCENARIO GROUP E — TIMER BEHAVIOR

---

**E1 — Timer starts correctly**
- Trigger: `READY` postMessage from iframe (or 3s fallback after LOAD)
- Starts at: 60 seconds
- Display: `#timer-value` updates every second (`60s → 59s → ... → 0s`)
- Test: Watch timer badge in game header

---

**E2 — Timer turns urgent (red pulsing) at 10 seconds**
- Condition: `State.timeLeft <= 10`
- Expected: `#timer-badge` gets class `urgent` → CSS pulse animation activates
- Test: Wait until timer reaches 10s

---

**E3 — Timer reaches 0 (natural expiry)**
- Expected: `stopTimer()` → `onExpire()` → `saveGame` with `status: 'expired'` → `screen-expired` shown
- Test: Don't solve puzzle; let timer count to 0

---

**E4 — Timer persists across tab switches / brief interruptions**
- Mechanism: Every 2 seconds, `{ timeLeft, dayId, ts }` is written to `flippedit_timer_v2` in localStorage
- On reload: If `dayId` matches today and `timeLeft > 0`, restored to `State.timeLeft`
- Test: Switch tabs mid-game and return; timer should continue from saved value

---

**E5 — Timer persistence cleared on game completion**
- Condition: Game completed or expired
- Expected: `localStorage.removeItem(CONFIG.TIMER_STATE_KEY)` called
- Test: Complete game → check localStorage for `flippedit_timer_v2` → should be gone

---

**E6 — Timer does NOT start before game screen is shown**
- Critical: Timer only starts when `State.currentScreen === 'game'` AND puzzle READY signal received
- Test: Observe timer badge shows `60s` static during loading, then begins counting only when puzzle is visible

---

### SCENARIO GROUP F — GAME COMPLETION

---

**F1 — Puzzle solved within time (COMPLETE/SOLVE event)**
- Condition: AmuseLabs iframe fires postMessage with type matching: `solve`, `complete`, `success`, `finish`, `win`, `done`
- Expected: `onComplete()` → timer stops → `saveGame` with `status: 'completed'` → results screen after 500ms delay
- Test: Solve the puzzle

---

**F2 — Score calculation**
- Formula: `(59 - timeSpent) + min(40, rawScore)`
- Example: Solved in 20s with 30 score from iframe → `(59-20) + 30 = 69`
- Rank: ≥80 = GOLD, ≥50 = SILVER, < 50 = BRONZE
- Test: Solve at different times and verify score/rank shown

---

**F3 — Time calculation when iframe provides its own timeTaken**
- Condition: `data.timeTaken > 0` from iframe postMessage
- Expected: Uses iframe's time directly; otherwise falls back to `CONFIG.MAX_TIME - State.timeLeft`
- Test: Check what AmuseLabs sends in completion event

---

**F4 — Result messages (randomized)**
- Condition: Results screen shown
- Expected: `msgTop` is randomly picked based on time bracket; `msgBottom` is one of 5 random messages
- Test: Complete game multiple times and verify messages vary

---

**F5 — Results screen from returning user (API-sourced)**
- Condition: `checkDailyLock` finds a completed log → `UI.showResults()` called with stored data
- Expected: Shows historical time and score from API log (not recalculated)
- Test: Login after already playing — results should match what was achieved

---

### SCENARIO GROUP G — EXPIRED SCREEN

---

**G1 — Expired screen from timer timeout**
- Message: Random from 5 options (e.g., "Happens to the best. This flip flopped.")
- Test: Let timer hit 0

---

**G2 — Expired screen from invalid/old QR**
- Message: "Link Expired — Looks like you scanned an older QR code."
- OR: "Access Denied — This game can only be accessed by scanning the QR code..."
- Test: Use old-date or paramless URL

---

**G3 — Expired screen from stale pending session**
- Message: Random expiry message (same as G1 pool)
- Condition: Pending game > 60s old, `checkDailyLock` detects it
- Test: Start game, abandon >60s, reopen

---

**G4 — Expired screen does NOT show results data**
- Logic: `if (log.status === 'expired') → redirectAway('expired')` skips `showResults`
- Test: Let timer expire, verify no score/time shown on expired screen

---

### SCENARIO GROUP H — SHARE FUNCTIONALITY

---

**H1 — Share button on results screen**
- Expected: `ShareManager.handle()` called → if `shareBlob` not ready, generates it → uses native share sheet
- Platforms: iOS/Android use `navigator.share` with file; desktop falls back to download

---

**H2 — Trophy card generation (off-screen)**
- Mechanism: `html2canvas` captures `#capture-card` (positioned at left: -9999px) → PNG blob
- Card shows: Player name, "FLIPPED IT TODAY", time, score, date
- Test: Tap share on results screen; verify image contains correct data

---

**H3 — Share card generated in background**
- Timing: `ShareManager.prepare()` is called immediately when results screen opens (background pregeneration)
- Expected: By the time user taps Share, blob is usually ready
- Test: Tap share immediately vs after a few seconds

---

**H4 — Share fallback (no native share support)**
- Condition: Desktop browser without `navigator.share`
- Expected: Image auto-downloads as `flippit-[name].png`
- Test: Open on desktop Chrome, tap Share

---

**H5 — Share card shows wrong/blank player name**
- Condition: `State.userName` is empty
- Expected: Card shows "Player" as fallback; filename is `flippit-Player.png`
- Test: Complete game without name registration (edge case)

---

### SCENARIO GROUP I — OFFLINE / NETWORK RESILIENCE

---

**I1 — Save game fails (network error)**
- Condition: `saveGame` fetch throws or returns non-OK
- Expected: Game data enqueued in `flippit_offline_queue` in localStorage; user sees normal flow
- Test: Disconnect network just before completing puzzle

---

**I2 — Offline queue flushed on next save**
- Condition: Next time `saveGame` is called (next session), `OfflineManager.flush()` runs first
- Expected: Queued items retry; successful ones removed; failed ones kept
- Test: Complete game offline → go online → next game's save should flush previous

---

**I3 — Token mismatch in offline queue**
- Condition: Stored token in queue differs from current session token
- Expected: Retries with current token automatically
- Test: Token refresh scenario (complex to test manually)

---

### SCENARIO GROUP J — SCREEN DESIGN / UI CHECKS

---

**J1 — Logo loads (bccl.in CDN)**
- URL: `https://bccl.in/wp-content/uploads/2026/04/FLIPPEDIT-Logo-Final-01.png`
- Appears on: Splash, header (auth screens), result, expired screens
- Test: Confirm logo renders across all screens; check on slow 3G

---

**J2 — Gotham font loads**
- URL: `https://bccl.in/wp-content/uploads/2026/04/GothamBook_2.ttf`
- Expected: All text uses Gotham; fallback is system font during load (`font-display: swap`)
- Test: Throttle network, observe FOUT (Flash of Unstyled Text)

---

**J3 — Expired screen timer image**
- URL: `https://bccl.in/wp-content/uploads/2026/04/timer.png`
- Test: Verify alarm clock image loads on expired screen

---

**J4 — Game header: timer badge visible**
- Expected: Shows only on `screen-game`; hidden on all other screens
- Test: Navigate through all screens

---

**J5 — Generic header (logo bar) visible**
- Expected: Shows only on `screen-login`, `screen-otp`, `screen-register`
- Test: Go through auth flow

---

**J6 — Scrollbars hidden globally**
- CSS: `scrollbar-width: none` + webkit scrollbar hidden
- Test: Long content (results screen on small phone); no scrollbar visible

---

**J7 — Viewport locked (no zoom)**
- Meta: `maximum-scale=1.0, user-scalable=no`
- Test: Pinch-zoom on iOS/Android — should not zoom

---

**J8 — Rounded iframe card**
- CSS: `.game-iframe-card { border-radius: 24px }`
- Test: Verify the AmuseLabs puzzle appears inside a rounded white card

---

**J9 — "How to Play" overlay**
- Expected: Opens on "HOW TO PLAY" tap; closes on ✕ button; works from splash screen only
- Test: Open and close overlay; verify blur backdrop

---

**J10 — Result card color is salmon (#F17660)**
- Test: Verify result card background is the correct brand salmon, not red

---

### SCENARIO GROUP K — CONSOLE / DEBUG MODE

---

**K1 — Console is silenced in production**
- Logic: If `?test=` or `?t=` param is absent, all `console.log/info/debug` are replaced with noop
- Test: Open DevTools on production URL — console should be clean

---

**K2 — Enable debug mode**
- URL: Add `?test=true` (combined with `?code=TOIIN&date=...`)
- Expected: All console logs become visible
- Test: `?code=TOIIN&date=20260506&test=true`
- Note: Because `initQueryParams` strips params, you may need to check if test param is read before stripping

---

---

## PART 3: API CALLS SUMMARY

| API | Endpoint | When Called | Payload |
|-----|----------|-------------|---------|
| `sendOtp` | `POST /send-otp` | User taps "GET OTP" | `{ phone }` |
| `verifyOtp` | `POST /verify-otp` | User enters 6-digit OTP | `{ phone, otp }` |
| `saveUser` | `POST /save-user` | Name registration | `{ user_name }` + Bearer token |
| `getUserStats` | `GET /user/:userId` | Every `checkDailyLock` call | Bearer token |
| `saveGame` | `POST /save-game` | On LOAD (pending), on complete, on expire | `{ g_id, user_id, score, time_taken, status, city }` |

**`saveGame` is called 3 times per session:**
1. `status: 'pending'` — when iframe LOAD fires
2. `status: 'completed'` — when puzzle solved
3. `status: 'expired'` — when timer hits 0 OR stale pending detected

**`user_id` note**: Uses `hash_id` (UUID) preferentially over integer `id`. Backend must accept both.

---

## PART 4: LOCALSTORAGE KEYS

| Key | Purpose | Cleared When |
|-----|---------|--------------|
| `flippit_v2_session` | User session `{ id, hash_id, name, token }` | Manual clear OR 401 response |
| `flippedit_timer_v2` | Timer state `{ timeLeft, dayId, ts }` | Game completes or expires |
| `flippit_offline_queue` | Failed saveGame payloads | Flushed successfully on next online save |
| `flippit_valid_YYYY-MM-DD` | Daily QR validation flag | Set on valid scan; removed on invalid attempt |

---

## PART 5: CONFIRMED BUGS (MUST FIX BEFORE GO-LIVE)

### BUG 1 — CRITICAL: `game-container` element missing from HTML
- **JS references**: `document.getElementById('game-container').style.opacity`
- **HTML has**: `id="game-iframe-wrap"` (different ID)
- **Impact**: LOAD event handler crashes silently; game opacity flicker code doesn't work; in worst case the lock-check redirect may fail
- **Fix**: Change `id="game-iframe-wrap"` to `id="game-container"` in HTML, OR update JS to `'game-iframe-wrap'`

### BUG 2 — MEDIUM: `playing-as-name` never populated
- **JS**: No code sets `document.getElementById('playing-as-name').textContent`
- **Impact**: "PLAYING AS:" bar always shows blank
- **Fix**: Add `document.getElementById('playing-as-name').textContent = State.userName || 'Player';` inside `UI.showScreen` when `name === 'game'`

### BUG 3 — LOW: `iframe-timeout-msg` element missing from HTML
- **JS**: `document.getElementById('iframe-timeout-msg').style.display = 'block'` (after 15s)
- **HTML**: Element does not exist in DOM
- **Impact**: 15-second warning never shows; silently fails (no crash due to optional chaining style `if (msg)`)
- **Fix**: Add `<p id="iframe-timeout-msg" style="display:none;">Taking longer than expected...</p>` inside `#iframe-loading-overlay`

### BUG 4 — LOW: `?test=true` debug param stripped before use
- URL params are cleaned with `window.history.replaceState` after `initQueryParams`
- The console silencer IIFE reads `?test=` BEFORE `initQueryParams` runs — so this is actually fine
- **Verify**: Confirm console logging works with `?code=TOIIN&date=TODAY&test=true`

---

## PART 6: TESTING CHECKLIST (Go-Live)

### Pre-Requisites
- [ ] Use a real device (iOS + Android) — not just desktop
- [ ] Test on Chrome (Android), Safari (iOS), Samsung Browser
- [ ] Use `?code=TOIIN&date=[TODAY_YYYYMMDD]` as base URL for all tests
- [ ] Have access to a test mobile number that can receive OTP

### URL Validation
- [ ] A1: No params → "Access Denied" expired screen
- [ ] A2: Old date → "Link Expired" expired screen
- [ ] A6: Valid today URL → Splash loads
- [ ] A8: URL cleaned after load (no params in address bar)

### Auth Flow
- [ ] B2: Fresh session → login screen after "LET'S START"
- [ ] B3: Enter 10-digit number → OTP sent → OTP screen
- [ ] B4: Less than 10 digits → alert shown
- [ ] B5: Fill 6 OTP boxes → auto-verify
- [ ] B6: Paste OTP → auto-verify
- [ ] B8: Resend OTP after 30s
- [ ] B10: First time user → register screen
- [ ] B11: Returning user → goes to game or results
- [ ] B12: Name < 3 chars → alert
- [ ] B13: Name valid → game loads

### Daily Lock
- [ ] C1: Not played today → game loads
- [ ] C2: Already completed → results shown
- [ ] C3: Already expired → expired screen
- [ ] C4: Pending < 60s → game continues
- [ ] C5: Pending > 60s → expired screen

### Game Loading
- [ ] D1: Returning user — game preloads in background
- [ ] D2: LOAD event → overlay hides
- [ ] D4: READY event → timer starts
- [ ] D7: "PLAYING AS:" shows correct name (after BUG 2 fix)
- [ ] D8: game-container opacity change works (after BUG 1 fix)

### Timer
- [ ] E1: Timer starts at 60, counts down
- [ ] E2: Timer badge pulses at ≤10s
- [ ] E3: Timer hits 0 → expired screen
- [ ] E4: Switch tab mid-game → timer resumes correctly
- [ ] E5: After completion → timer key removed from localStorage

### Game Completion
- [ ] F1: Solve puzzle → results screen
- [ ] F2: Score and rank correct (Gold ≥80, Silver ≥50, Bronze <50)
- [ ] F4: Messages vary across multiple completions

### Expired Screen
- [ ] G1: Timer 0 → correct random expiry message
- [ ] G2: Bad URL → "Access Denied" or "Link Expired" message

### Share
- [ ] H1: Share button works on results screen
- [ ] H2: Trophy card image generated with correct name, score, date
- [ ] H4: Desktop fallback → image downloads

### UI/Design
- [ ] J1: Logo renders on all screens
- [ ] J2: Gotham font loaded (not system font)
- [ ] J4: Timer badge only in game screen
- [ ] J7: No zoom on mobile
- [ ] J8: Iframe in rounded card
- [ ] J9: "How to Play" opens/closes

### Offline
- [ ] I1: Network disconnect before submit → queued offline
- [ ] I2: Reconnect → queue flushed on next action

---

## PART 7: SCORE CALCULATION REFERENCE

```
Formula: scoreVal = (59 - timeSpent) + min(40, rawScore)

Where:
  timeSpent = seconds taken (min 1, max 60)
  rawScore  = accuracy score from AmuseLabs iframe

Examples:
  10s, score 40 → (59-10) + 40 = 49 + 40 = 89  → GOLD
  25s, score 20 → (59-25) + 20 = 34 + 20 = 54  → SILVER
  55s, score 10 → (59-55) + 10 = 4  + 10 = 14  → BRONZE
  60s (timeout) → status: expired (score irrelevant)
```

---

*Document generated from full code review of `index_production.html` | Flippit v2 Production Build*
