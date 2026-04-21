# Flippit FULL API Audit - 18 April 2026

This is the comprehensive report for every API endpoint used in the Flippit Game.

## 1. OTP Delivery (Next.js Proxy -> AWS SNS)
**Endpoint:** `POST /api/otp/send`
- **Result:** SUCCESS
- **Audit:** Based on production logs from `2026-04-18T20:31:37`.
- **Response:** `{"message": "OTP sent"}` (200 OK)
- **Status:** Verified.

## 2. OTP Verification (Next.js Proxy -> AWS Lambda)
**Endpoint:** `POST /api/otp/verify`
- **Result:** SUCCESS
- **Audit:** Based on production logs from `2026-04-18T20:31:51`.
- **Response:** 
```json
{
  "OTPVerified": true,
  "UserId": "9f76794c-b502-4101-9acc-afa693c5682f",
  "token": "Valid JWT Token",
  "UserName": "Maniraj"
}
```
- **Status:** Verified.

## 3. User Statistics & Initialization (Direct AWS Access)
**Endpoint:** `GET /user/9f76794c-b502-4101-9acc-afa693c5682f`
- **Result:** SUCCESS
- **Discovery:** This is where we extract the **Numeric ID** (`30`) needed for saving games.
- **Audit Result:** Returns full user profile + array of `gameLogs`.
- **Status:** Healthy.

## 4. Name Registration (Direct AWS Access)
**Endpoint:** `POST /save-user`
- **Result:** SUCCESS
- **Verification:** Successfully changed name to `"Maniraj Audit"` during live test.
- **Response:** `{"message":"user name updated"}`
- **Status:** Write-access confirmed.

## 5. Game Persistence (Direct AWS Access)
**Endpoint:** `POST /save-game`
- **Result:** SUCCESS
- **Audit:** Sent score `99` using `user_id: 30` and `city: "TOIIN"`.
- **Response:** `{"message":"Game log Completed Updated"}` 
- **Critical Note:** This API **fails** with "Default Response" if sent the string ID. It requires the numeric ID `30`.
- **Status:** Recovered and Verified.

---

### **Discrepancy Resolution Summary**
- **User ID Type**: The `save-game` API takes a **Number** as input, but the `getUserStats` API returns the **String** in the logs. This is now handled automatically by our updated frontend logic.
- **Legacy Fields**: `city: "TOIIN"` is mandatory for the backend to recognize the event as a valid Flippit game.

**Final Verdict:** All 5 core API stages are fully operational and verified.
