# Flippit: Comprehensive Design System & Content Guide
> **Version:** 3.4  |  **Source of Truth:** index.html (Production)  
> **Standard Applied:** TOI Brand "Rule of Three" — Full Uniformity Pass

---

## 1. Core Design Tokens (Globals)

### 1.1 Brand Palette
| Name | CSS Variable | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Brand Red** | `--brand-red` | `#9d071c` | Global background, game header, timer pulse |
| **Brand Brown** | `--brand-brown` | `#540000` | Primary buttons, stat tiles, card headings |
| **Brand Salmon** | `--brand-salmon` | `#F17660` | Result card BG, How-to-play panel BG, expired badge |

### 1.2 Typography Foundation
- **CSS Variables:** `--font-heading`, `--font-body`, `--font-numbers` — All resolve to `'Gotham', 'Inter', sans-serif`
- **Primary font:** Gotham (local file `GothamBook_2.ttf`)
- **Web fallback:** Inter (Google Fonts CDN)

---

## 2. The "Rule of Three" — Unified Font Scale

> This is the enforced scale. **No ad-hoc inline font-size overrides are permitted for these roles.**

| Level | Size | Weight | Letter Spacing | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Heading** | `20px` | `900` | `0.05em` | Page/screen headings (e.g. `Enter Full Name`, `Mission Accomplished!`) |
| **Sub-heading** | `18px` | `700–800` | `0.04–0.08em` | Screen category labels (e.g. `ENTER OTP`, `ENTER MOBILE NUMBER`, Expired message) |
| **Primary UI** | `16px` | `700` | `0.05em` | All `.btn-primary` buttons, all `.input-field` inputs |
| **Body / Label** | `14px` | `500–600` | — | Step descriptions, result footer message |
| **Secondary** | `13px` | `400–700` | `0.05em` | Helper notes, countdowns, closing remarks |

---

## 3. Standardized UI Components

### 3.1 Buttons Master Table
| Button | CSS Class | Exact Text | Size | Weight | Background | Width |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Splash Start | `.btn-primary` | `LET'S START` | `16px` | `700` | Brown | Auto (36px padding) |
| Get OTP | `.btn-primary` | `GET OTP` | `16px` | `700` | Brown | `240px` |
| Verify | `.btn-primary` | `VERIFY` | `16px` | `700` | Brown | `260px` max |
| Start Playing | `.btn-primary .btn-full` | `START PLAYING` | `16px` | `700` | Brown | `100%` |
| Share | `.btn-share` | `SHARE` | `15px` | `900` | White | Auto (pill) |
| How to Play | `.btn-how` | `HOW TO PLAY` | `12px` | `700` | None | Auto |
| Edit Mobile | `.btn-edit` | *(Pencil SVG icon)* | — | — | None | — |
| Resend OTP | `.btn-resend` | `RESEND OTP` | `10px` | `700` | None | Auto (icon+text) |
| Close (Result/Expired) | `.btn-close-result` | `×` | `20px` | `400` | None | Absolute top-right |
| Close (How-to) | `.btn-close-how` | `✕` | `20px` | `400` | None | Absolute top-right |

### 3.2 Inputs Master Table
| Input | ID | Placeholder | Size | Weight | Max-Width | Special |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Mobile Number | `#mobile-input` | `10-digit number` | `16px` | `700` | `240px` | `3px` letter-spacing |
| OTP Box (×6) | `.otp-box` | *(numeric)* | `24px` | `800` | `44px` each | Auto-focus next box |
| Full Name | `#name-input` | `Your full name` | `16px` | `400` | `100%` | Center-aligned |

---

## 4. Screen-by-Screen Audit (Complete)

### 4.1 Splash Screen
| Element | Exact Text | CSS Class | Size | Weight |
| :--- | :--- | :--- | :--- | :--- |
| Logo | *(TOI Flippit Logo image)* | `.logo-wrap img` | `280px` | — |
| Tagline | `FLIP THE WORDS. CRACK THE LOGIC. BEAT THE CLOCK.` | `.tagline` | `14px` | `800` |
| Start Button | `LET'S START` | `.btn-primary` | `16px` | `700` |
| How-to Link | `HOW TO PLAY` | `.btn-how` | `12px` | `700` |

### 4.2 Login Screen (Mobile Entry)
| Element | Exact Text | CSS Class | Size | Weight |
| :--- | :--- | :--- | :--- | :--- |
| Header Label | `ENTER MOBILE NUMBER` | `.auth-sub` | `18px` | `700` |
| Sub-note | `First time login only` | `.auth-note` | `13px` | `400` |
| Mobile Input | Placeholder: `10-digit number` | `#mobile-input` | `16px` | `700` |
| Action Button | `GET OTP` | `.btn-primary` | `16px` | `700` |

### 4.3 OTP Screen
| Element | Exact Text | CSS Class | Size | Weight |
| :--- | :--- | :--- | :--- | :--- |
| Header Label | `ENTER OTP` | `.auth-sub` | `18px` | `700` |
| OTP Boxes (×6) | *(numeric input)* | `.otp-box` | `24px` | `800` |
| Countdown | `Resend OTP in 30s` | Inline (13px standard) | `13px` | `400` |
| Action Button | `VERIFY` | `.btn-primary` | `16px` | `700` |
| Resend Button | `RESEND OTP` | `.btn-resend span` | `10px` | `700` |

### 4.4 Registration Screen
| Element | Exact Text | CSS Class | Size | Weight |
| :--- | :--- | :--- | :--- | :--- |
| Screen Heading | `Enter Full Name` | `.auth-heading h3` | `22px` | `900` |
| Name Input | Placeholder: `Your full name` | `.input-field` | `16px` | `400` |
| Action Button | `START PLAYING` | `.btn-primary .btn-full` | `16px` | `700` |
| Promo Text | `You might just make it to the pages of TOI!` | `.register-note` | `14px` | `400` |

### 4.5 Game Screen (Header Bar)
| Element | Exact Text | CSS Class | Size | Weight |
| :--- | :--- | :--- | :--- | :--- |
| Logo | *(TOI Logo)* | `#game-header img` | `48px` height | — |
| Player Bar | `PLAYING AS: [NAME]` | `.playing-as-bar` | `11px` | `900` |
| Timer Value | `60s` (live countdown) | `#timer-value` | `24px` | `900` |

### 4.6 Result Screen
| Element | Exact Text | CSS Class | Size | Weight |
| :--- | :--- | :--- | :--- | :--- |
| Logo | *(TOI Logo)* | `.result-logo` | `160px` | — |
| Top Message | `Mission Accomplished!` *(time-based)*| `.result-msg-top` | `20px` | `900` |
| Stat Icons | `⏱️` and `⭐` | `.stat-icon-up` | `26px` | — |
| Stat 1 Label | `Solved in` | `.stat-label-small` | `16px` | `700` |
| Stat 1 Value | `[N] secs` | `.stat-value-large` | `20px` | `900` |
| Stat 2 Label | `Your Score` | `.stat-label-small` | `16px` | `700` |
| Stat 2 Value | `[N]/100` | `.stat-value-large` | `20px` | `900` |
| Bottom Message | *(Randomized — 6 pool variants)* | `.result-msg-bottom` | `14px` | `600` |
| Share Button | `SHARE` | `.btn-share` | `15px` | `900` |

### 4.7 Expired / Timeout Screen
| Element | Exact Text | CSS Class | Size | Weight |
| :--- | :--- | :--- | :--- | :--- |
| Logo | *(TOI Logo)* | `.result-logo` | `160px` | — |
| Clock Icon | *(SVG: Clock + Sad-face badge)* | Inline SVG | `150px` frame | — |
| Expiry Message | *(JS-injected, randomized)* | `#expired-message` | `18px` | `800` |

### 4.8 How to Play Overlay
| Element | Exact Text | CSS Class | Size | Weight |
| :--- | :--- | :--- | :--- | :--- |
| Panel Title | `How to Play Flipped It` | `.how-header-title` | `18px` | `900` |
| Step Descriptions (×7) | *(Steps 1–7)* | `.step-desc` | `14px` | `500` |
| Closing Note | `Happy playing!` | `.how-footer-note` | `13px` | `900` |

### 4.9 Trophy Card (Off-screen Capture)
> Note: Trophy card uses a deliberately scaled-up type system because it is rendered as a 600×700px image for social sharing.

| Element | Exact Text | CSS Class | Size | Weight |
| :--- | :--- | :--- | :--- | :--- |
| Logo | *(TOI Logo)* | `.cap-flippit-logo` | `280px` | — |
| Player Heading | `[NAME] FLIPPEDIT TODAY` | `.cap-user-heading` | `20px` | `900` |
| Tile Icons | `⏱️` and `⭐` | `.cap-tile-icon` | `32px` | — |
| Stat Label | `Solved in` / `Score` | `.cap-tile-label` | `12px` | `700` |
| Stat Value | `[N] secs` / `[N]/100` | `.cap-tile-value` | `22px` | `900` |
| Date Display | `DD/MM/YYYY` | `.cap-footer-date` | `14px` | `700` |

---

## 5. Business-Approved Content Strings

### 5.1 Time-Based Success Messages (Result Screen Top)
| Solve Time | Message |
| :--- | :--- |
| 1–20s | `Fastest fingers in town!` |
| 21–35s | `You're on fire!` |
| 36–50s | `You crushed it!` |
| 51–60s | `Mission accomplished!` |

### 5.2 Completion Footer — Random Pool (6 variants)
1. `Great flip! Another one lands tomorrow. Until then, enjoy the rest of today's paper.`
2. `Well played! A fresh flip awaits tomorrow. For now, keep going through today's newspaper.`
3. `Nice work! Tomorrow brings a new challenge. Until then, flip through today's edition.`
4. `Smooth finish! Another puzzle drops tomorrow. Meanwhile, dive back into today's paper.`
5. `You aced it! Come back for tomorrow's flip. Until then, carry on with today's reading.`
6. `Flip mastered! A new one arrives tomorrow. For now, enjoy the rest of today's newspaper.`

### 5.3 Other Fixed Copy
- **Tagline:** `FLIP THE WORDS. CRACK THE LOGIC. BEAT THE CLOCK.`
- **Registration Promo:** `You might just make it to the pages of TOI!`
- **Expired QR Disclaimer:** `Looks like you scanned an older QR code. Please scan the QR from today's TOI edition to continue.`
- **How-to-play closing:** `Happy playing!`

---

## 6. Layout & Dimension Reference
| Component | Spec |
| :--- | :--- |
| App Shell | Fixed `100dvh`, zero scrollbars |
| Auth Container | `max-width: 320px`, centered |
| Result/Expired Inner | `max-width: 330px`, `padding: 40px 25px` |
| Result Card | Salmon BG, `border-radius: 12px`, `padding: 24px` |
| Stats Grid | `max-width: 220px`, 2 tiles, `gap: 4px` |
| Trophy Card Canvas | `600px × 700px`, Salmon card `400px` wide |
| Logos | Splash: `280px` \| Results: `160px` \| Game: `48px` height |

---
*Documentation v3.4 — Full uniformity pass completed 21 April 2026.*  
*All inline style overrides replaced with CSS classes. Rule of Three font scale enforced across all 9 screens.*
