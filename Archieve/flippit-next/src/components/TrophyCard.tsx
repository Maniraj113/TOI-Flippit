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
    { label: "SOLVED IN",  value: `${timeTaken}`, suffix: "secs", icon: Clock,         color: "#FFFFFF" },
    { label: "YOUR SCORE", value: score,           suffix: "/100", icon: Zap,          color: "#FFD700" },
    { label: "TOTAL FLIP", value: totalFlips,      suffix: "",     icon: RotateCcw,    color: "#FFFFFF" },
    { label: "WIN",        value: `${winRate}%`,   suffix: "",     icon: CheckCircle2, color: "#4ADE80" },
    { label: "LIVE STREAK",value: streak,          suffix: "",     icon: Flame,        color: "#FB923C" },
    { label: "BEST STREAK",value: bestStreak,      suffix: "",     icon: Star,         color: "#FDE047" },
  ];

  return (
    <div
      ref={ref}
      id="capture-card"
      style={{
        position: "absolute",
        top: 0,
        left: -9999, // Move off-screen
        width: 1080,
        height: 1080,
        background: "#990000", // Match ResultScreen's specific red
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "30px 0",
        overflow: "hidden",
        pointerEvents: "none",
        fontFamily: "var(--font-outfit), sans-serif",
        boxSizing: "border-box"
      }}
    >
      {/* Top Logo */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo_transparent.png"
          alt="TOI Logo"
          style={{
            height: 100, 
            width: "auto",
            filter: "brightness(0) invert(1)"
          }}
        />
      </div>

      {/* Celebrating Content */}
      <div style={{ textAlign: "center", marginBottom: 30, padding: "0 60px" }}>
        <div style={{ 
          fontSize: 32, 
          fontWeight: 900, 
          color: "white", 
          textTransform: "uppercase", 
          letterSpacing: "0.1em",
          lineHeight: 1.1
        }}>
          MISSION ACCOMPLISHED!
        </div>
        <div style={{ 
          fontSize: 18, 
          color: "rgba(255,255,255,0.7)", 
          fontWeight: 700, 
          marginTop: 8,
          fontFamily: "var(--font-montserrat), sans-serif"
        }}>
          You aced it! Another day, another flip mastered.
        </div>
      </div>

      {/* Inner Card (Salmon) */}
      <div style={{
        width: "92%",
        background: "#F17660",
        borderRadius: 60,
        padding: "40px 40px",
        display: "flex",
        flexDirection: "column",
        gap: 30,
        boxShadow: "0 30px 60px rgba(0,0,0,0.3)"
      }}>
        <div style={{ textAlign: "center" }}>
          <h3 style={{
            fontSize: 24,
            fontWeight: 800,
            color: "rgba(84, 0, 0, 0.6)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 6
          }}>
            {userName ? `${userName}'S RESULT` : "FINAL PROOF'S RESULT"}
          </h3>
          <h2 style={{
            fontSize: 68,
            fontWeight: 900,
            color: "#540000",
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            lineHeight: 1.0,
            marginBottom: 10
          }}>
            I FLIPPED IT.<br />HOW ABOUT YOU?
          </h2>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: "#540000",
              borderRadius: 28,
              padding: "30px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              color: "white",
              position: "relative",
              minHeight: 140
            }}>
              <div style={{ 
                fontSize: 20, 
                fontWeight: 800, 
                opacity: 0.7, 
                marginBottom: 12, 
                letterSpacing: "0.05em"
              }}>
                {s.label}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <div style={{ 
                  fontSize: 64, 
                  fontWeight: 900, 
                  lineHeight: 1
                }}>
                  {s.value}
                </div>
                {s.suffix && <span style={{ fontSize: 20, opacity: 0.5, fontWeight: 700 }}>{s.suffix}</span>}
              </div>
              <div style={{ position: "absolute", bottom: 24, right: 24 }}>
                <s.icon size={44} color={s.color} strokeWidth={2.5} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Branding */}
      <div style={{ 
        marginTop: "auto", 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        gap: 8,
        paddingBottom: "30px"
      }}>
        <div style={{ 
          fontSize: 30, 
          fontWeight: 900, 
          color: "white", 
          letterSpacing: "0.15em", 
          opacity: 0.9
        }}>
          FLIPPIT.TIMESOFINDIA.COM
        </div>
        <div style={{ 
          fontSize: 16, 
          fontWeight: 700, 
          color: "rgba(255, 255, 255, 0.4)", 
          letterSpacing: "0.4em",
          fontFamily: "var(--font-montserrat), sans-serif"
        }}>
          #TOIGAMES #FLIPPIT #BRAINTRAIN
        </div>
      </div>
    </div>
  );
});

TrophyCard.displayName = "TrophyCard";
export default TrophyCard;
