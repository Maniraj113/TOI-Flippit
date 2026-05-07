# FlippedIt: Version Comparison Report (Legacy vs. Production)

| Feature / Category | Legacy Implementation (`index (9).html`) | New Production Standard (`index_production.html`) | Why it Matters |
| :--- | :--- | :--- | :--- |
| **Tech Stack** | jQuery & scattered scripts. | Pure Vanilla JS (Modular & Encapsulated). | Faster loading & easier to maintain. |
| **URL Parameters** | `code=` and `date=` (Strict). | `code=`, `city=`, `c=` (with fallback logic). | Handles both new QR codes and legacy links. |
| **User ID Type** | Handled as Number/String mix (Caused NaN errors). | **Strict UUID String** (e.g., "681023a0..."). | Ensures data is never lost in the dashboard. |
| **Game Tracking** | Only logs when game is COMPLETED. | Logs **PENDING** on load + **COMPLETED** on finish. | Allows team to see "Start vs. Finish" drop-off. |
| **Session Locking** | Basic local check. | **Server-Verified Daily Lock** (60s stale check). | Prevents multiple plays and ensures data integrity. |
| **Iframe Reliability** | Loads when screen appears (Caused white flash). | **Background Warm-up** (Loads during login). | Instant game appearance for the user. |
| **Data Recovery** | If network fails, data is lost. | **Offline Management Queue** (Retries on sync). | Saves results even on spotty mobile networks. |
| **Visual Design** | Basic HTML/CSS default styling. | **Premium Glassmorphism** & Outfit Typography. | Feels like a high-end corporate product. |
| **Security** | Console logs visible to everyone. | **Production Console Sanitization**. | Protects API endpoints from public view. |
| **URL Cleanup** | Query params remain visible in browser. | **Automatic URL Stripping** after validation. | Prevents users from sharing pre-validated links. |
| **Expiry Logic** | Simple "Old Date" message. | **Instant Populated Messages** (No text lag). | Better user experience on slow connections. |

---
**Status**: Ready for Pilot Deployment.
**Validated By**: Antigravity AI Engine.
