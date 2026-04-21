# Project Flippit: Business & Design Brief for AI Brainstorming

## 🎯 Project Overview
**Flippit** is a high-engagement, daily word puzzle game developed for **The Times of India (TOI)**, India's leading news publication. It is designed to be a quick "brain break" for readers, integrated into the TOI digital ecosystem and accessible via QR codes in the physical newspaper.

- **The Hook**: Users have 60 seconds to solve a scrambled word puzzle.
- **The Reward**: A premium, shareable "Trophy Card" that summarizes their speed, score, and daily streak.
- **The Brand Identity**: Authoritative, premium, trust-worthy, yet modern and "alive."

---

## 🎨 Visual Identity & Design Language
The design must feel like a premium extension of the Times of India brand.

### 1. Color Palette
- **Primary Brand Red**: `#9d071c` (Deep, rich Red)
- **Accent Brown**: `#540000` (Dark, earthy Brown - used for tiles and depth)
- **Signature Salmon**: `#F17660` (Vibrant, soft Red - used for the main Result Card)
- **Highlight Gold**: `#FFD700` (Used for scores and achievements)
- **Neutral White/Glass**: Used for contrast and readability.

### 2. Typography
- **Core Font**: **Gotham** (Geometric, professional, clean).
- **Secondary**: **Outfit** (Modern, tech-focused, used for timers and numbers).
- **Vibe**: Bold headings, clear hierarchy, high-contrast values.

### 3. Key Layout Elements (Current)
- **Result Page**: A centered layout with a "Message of the Day," a large central "Achievement Card," and a primary Action Button (Share).
- **Stats Grid**: A 2-column grid showing:
    - **SOLVED IN**: Time in seconds.
    - **SCORE**: Points out of 100.
    - **WIN %**: Historical accuracy.
    - **LIVE STREAK**: Consecutive days played.

---

## 💡 AI Prompting Goals
Use this information to ask other AI models for:

### Task A: Result Screen Redesign
> "Design a premium, mobile-first 'Result Screen' for a newspaper-branded word puzzle game. The brand is 'The Times of India.' Colors: Deep Red (Primary), Rich Brown (Secondary), and Salmon (Accent). The screen needs to look high-end, using glassmorphism or sleek gradients. Key elements: A celebratory header message ('FASTEST FINGERS IN TOWN!'), a central results card with 2-tile stats grid (Solved In, Score), and a prominent 'Share My Trophy' button. The font should be geometric and clean like Gotham. Make it feel like a badge of honor, not just a stats page."

### Task B: Viral Share Card (Trophy Card)
> "Conceptualize a 'Shareable Trophy Card' (1080x1080) for a daily puzzle game. It should look like a premium social media post. Branding: Times of India. Aesthetics: A deep red background with a central salmon-colored card. On the card: A large headline 'I FLIPPED IT!', the user's name, and two large, high-impact stat tiles (Time and Score) with gold icons. Include room for a 'Daily Streak' fire icon. The overall look should be 'Insta-worthy'—bold, high-contrast, and expensive-looking."

---

## 🛠️ Technical Constraints (For Context)
- **Stack**: Vanilla HTML/CSS/JS (no framework).
- **Responsiveness**: Target is primarily mobile (smartphones).
- **Generation**: The share card is generated as a PNG using `html2canvas`. Avoid overly complex 3D shadows or filters that might break during canvas rendering.
