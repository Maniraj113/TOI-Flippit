"use client";
import { forwardRef } from "react";
import { Clock, Zap, Flame, Star, CheckCircle2, RotateCcw } from "lucide-react";

interface TrophyCardProps {
  userName: string;
  score: number;
  timeTaken: number;
  totalFlips: number;
  winRate: number;
  streak: number;
  bestStreak: number;
}

const TrophyCard = forwardRef<HTMLDivElement, TrophyCardProps>(({
  userName, score, timeTaken, totalFlips, winRate, streak, bestStreak
}, ref) => {
  const stats = [
    { l: "SOLVED IN",  v: `${timeTaken}s`, icon: Clock,         color: "#60a5fa" },
    { l: "YOUR SCORE", v: score,           icon: Zap,           color: "#ffd700" },
    { l: "TOTAL FLIP", v: totalFlips,      icon: RotateCcw,     color: "#fff" },
    { l: "WIN",        v: `${winRate}%`,   icon: CheckCircle2,  color: "#4ade80" },
    { l: "LIVE STREAK",v: streak,          icon: Flame,         color: "#fb923c" },
    { l: "BEST STREAK",v: bestStreak,      icon: Star,          color: "#fbbf24" },
  ];

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: 0,
        left: -9999, // Move off-screen instead of hiding
        width: 1080,
        height: 1080,
        background: "#F17660",
        color: "white",
        fontFamily: "'Montserrat', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "80px 60px",
        overflow: "hidden",
        pointerEvents: "none"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <img 
          src="/logo_transparent.png" 
          alt="TOI Logo" 
          style={{ 
            height: 80, 
            width: "auto"
          }} 
        />
        <div style={{ color: "#540000", fontSize: 24, fontWeight: 800, letterSpacing: "0.25em", opacity: 0.8 }}>OFFICIAL RESULT</div>
      </div>

      {/* Hero Section */}
      <div style={{ textAlign: "center", width: "100%", marginTop: 20 }}>
        <h1 style={{ fontSize: 100, fontWeight: 900, color: "#540000", fontFamily: "'Outfit', sans-serif", textTransform: "uppercase", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 10 }}>
          {userName}&apos;s<br/>Flipped it
        </h1>
        <p style={{ fontSize: 48, fontWeight: 700, color: "#540000", opacity: 0.8, fontFamily: "'Montserrat', sans-serif" }}>
          i flipped it how about you?
        </p>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, width: "100%" }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: "#540000",
            borderRadius: 24, 
            padding: "32px 20px",
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center",
            boxShadow: "0 12px 24px rgba(0,0,0,0.1)"
          }}>
            <s.icon size={36} color={s.color} strokeWidth={2.5} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1, color: "#fff", marginBottom: 4 }}>{s.v}</div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#540000", letterSpacing: "0.05em" }}>FLIPPIT.TIMESOFINDIA.COM</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(84, 0, 0, 0.4)", letterSpacing: "0.2em" }}>#TOIGAMES #FLIPPIT #BRAINTRAIN</div>
      </div>
    </div>
  );
});



TrophyCard.displayName = "TrophyCard";
export default TrophyCard;
