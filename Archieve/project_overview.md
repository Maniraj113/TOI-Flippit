# Flippit Project Overview & Architecture

This document provides a high-level "Complete Picture" of the Flippit Game project to help developers understand the full lifecycle, tech stack, and critical design decisions.

---

## 1. Project Vision
Flippit is a premium, mobile-first memory game for **The Times of India (TOI)**. It aims to drive daily engagement through a "Daily Lock" mechanism where users can only play once per day to compete for a high score.

---

## 2. Tech Stack
- **Frontend Framework**: Next.js 15 (App Router)
- **Styling**: Vanilla CSS + CSS Variables for TOI Branding.
- **Animations**: Framer Motion (for liquid-smooth transitions between screens).
- **Icons**: Lucide React.
- **Typography**: Outfit & Playfair Display (TOI Standard).
- **Backend**: AWS API Gateway + Lambda + DynamoDB (accessible via REST).

---

## 3. Core Directory Structure
```text
flippit-next/
├── public/                # Static assets (TOI Logo, etc.)
├── src/
│   ├── app/               # Main Application Logic
│   │   ├── api/           # Next.js API Proxy Routes
│   │   ├── page.tsx       # MONOLITHIC ENTRY POINT (Splash, Auth, Game, Result)
│   │   └── layout.tsx     # Global styling & Font metadata
│   ├── components/        # Reusable UI Blocks
│   │   ├── GameContainer  # The actual game logic & board
│   │   └── TrophyCard     # The result card for sharing
│   ├── lib/               # Utilities
│   │   └── api.ts         # Centralized API Client
│   └── hooks/             # Custom React Hooks
└── Start_Project.bat     # One-click dev startup
```

---

## 4. Key Logic Pillars

### A. The "Daily Lock" System (Critical)
To maintain the competitive integrity of the game, users are locked out after one full game per day.
- **Logic**: The app calls `getUserStats` and iterates through `gameLogs`. 
- **Timezone**: It uses `Asia/Kolkata` (IST) to compare the `created_at` timestamp with the current date.
- **Enforcement**: This check happens at the Splash screen (for persistent sessions) and immediately after OTP verification (for new logins).

### B. Scalable Branding
The brand identity is enforced through a **Unified Global Header**. 
- The logo is deliberately sized to be larger than the timer (`80px` or `56px`) to ensure the TOI brand is the most prominent element on screen.
- The primary color is `#9d071c` (Brand Red).

### C. The Game Engine (AmuseLabs)
The core memory game is an iframe integration from AmuseLabs. We wrap this iframe in a `GameContainer` that communicates with the Next.js parent via `window.postMessage` (if applicable) or through local state management to detect game completion.

### D. Result Sharing
Upon completion, the app uses `html2canvas` to capture the `TrophyCard` component. This allows users to download/share a high-fidelity image of their score, which includes the TOI logo and the game's unique score parameters.

---

## 5. Development Workflow
1. Run `Start_Project.bat`.
2. Access `http://localhost:3000`.
3. Use **Debug Mode** (if enabled) to skip OTP and test the game loop quickly.
4. Verify "Daily Lock" by completing a game and trying to reload.

---

## 6. Known "Gotchas"
- **Z-Index**: The global header must always be `1000+` to stay above the game board.
- **Nested API Data**: AWS responses often wrap data in a `{ data: { ... } }` object. Always verify the structure in `lib/api.ts`.
- **Viewport**: The app is designed to be **scroll-free**. Use `100dvh` for full-height layouts.
