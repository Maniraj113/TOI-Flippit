"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, Zap, Flame, Star, CheckCircle2, RotateCcw, Timer, Pencil, RefreshCw,
  Phone, KeyRound, User, Eye, Lightbulb, Share2
} from "lucide-react";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";

import GameContainer from "@/components/GameContainer";
import TrophyCard from "@/components/TrophyCard";
import { useDebugMode } from "@/hooks/useDebugMode";
import { flippitApi } from "@/lib/api";
import type { UserSession, GameLog } from "@/lib/api";

/* ─────────────── Types ─────────────── */
type Screen = "splash" | "login" | "otp" | "register" | "game" | "result" | "expired";
interface ScoreData { 
  score: number; 
  timeTaken: number; 
  streak: number; 
  bestStreak: number; 
  accuracy: number; 
  totalFlips: number; 
  winRate: number; 
  rank: string; 
  msgTop?: string;
  msgBottom?: string;
}

/* ─────────────── Helpers ─────────────── */
// fmt unused, removed to satisfy linting

/* ─────────────── How To Play Modal ─────────────── */
function HowToPlay({ onClose }: { onClose: () => void }) {
  const steps = [
    { icon: Eye, title: "Read the board", desc: "Look at the scrambled flip-board letter tiles." },
    { icon: Lightbulb, title: "Guess the word", desc: "Figure out the hidden word or phrase." },
    { icon: Timer, title: "Beat the clock", desc: "You have 60 seconds — every second counts!" },
    { icon: CheckCircle2, title: "Flip it!", desc: "Select the correct letters in order to score." },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[430px] rounded-t-[40px] overflow-hidden shadow-2xl"
        style={{ background: "#540000", padding: "40px 24px 56px" }}
      >
        <div className="flex items-center justify-between mb-10">
          <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "0.05em" }}>HOW TO PLAY</h2>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.3)", fontSize: 24, background: "none", border: "none", cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(255,215,0,0.08)", border: "1.5px solid rgba(255,215,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <s.icon size={24} color="#ffd700" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, fontWeight: 500 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="btn-primary"
          style={{
            marginTop: 48,
            width: "100%",
            padding: "16px",
            fontSize: 18,
            fontFamily: "var(--font-playfair), serif"
          }}
        >
          LET'S START
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────── Splash Screen ─────────────── */
function SplashScreen({ onStart, onHow }: { onStart: () => void; onHow: () => void }) {
  return (
    <motion.div
      key="splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="screen-container"
      style={{ justifyContent: "center", gap: 60 }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: 48 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <motion.img
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            src="/logo_transparent.png"
            alt="TOI Flippit Logo"
            style={{ width: "100%", maxWidth: 280, height: "auto" }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ textAlign: "center", color: "white", fontFamily: "var(--font-playfair), serif" }}
          >


          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: 14,
            fontWeight: 800,
            textAlign: "center",
            color: "white",
            lineHeight: 2.2,
            textTransform: "uppercase",
            letterSpacing: "0.2em"
          }}
        >
          FLIP THE WORDS.<br />
          CRACK THE LOGIC.<br />
          BEAT THE CLOCK.
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginTop: 48 }}
      >
        <button
          onClick={onStart}
          className="btn-primary"
          style={{
            padding: "12px 32px",
            fontSize: 16,
            letterSpacing: "0.05em",
            fontFamily: "var(--font-playfair), serif"
          }}
        >
          LET'S START
        </button>
        <button
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            marginTop: 8,
            opacity: 0.6,
            textDecoration: "underline"
          }}
          onClick={onHow}
        >
          HOW TO PLAY
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────── Auth Screen ─────────────── */
interface AuthScreenProps {
  screen: "login" | "otp" | "register";
  mobile: string; otp: string; userName: string; loading: boolean;
  setMobile: (v: string) => void; setOtp: (v: string) => void; setUserName: (v: string) => void;
  onSendOtp: () => void; onVerifyOtp: () => void; onSaveUser: () => void; onBack: () => void;
}

function AuthScreen(props: AuthScreenProps) {
  const cfg = {
    login: { icon: Phone, t: "LOGIN", s: "ENTER MOBILE NUMBER" },
    otp: { icon: KeyRound, t: "VERIFY", s: "ENTER OTP SENT TO YOUR PHONE" },
    register: { icon: User, t: "REGISTER", s: "ENTER NAME TO START" },
  }[props.screen];

  return (
    <motion.div
      key={`auth-${props.screen}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="screen-container"
      style={{ justifyContent: "center", paddingTop: "0" }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: 320, marginTop: "20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, letterSpacing: "0.05em" }}>{cfg.t}</h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{cfg.s}</p>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          {props.screen === "login" && (
            <>
              <input type="tel" placeholder="10-digit number" value={props.mobile} onChange={e => props.setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} className="input-field" inputMode="numeric" />
              <button className="btn-primary btn-full" disabled={props.loading || props.mobile.length < 10} onClick={props.onSendOtp}>
                {props.loading ? "SENDING…" : "GET OTP"}
              </button>
            </>
          )}
          {props.screen === "otp" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20, opacity: 0.8 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{props.mobile}</span>
                <button onClick={props.onBack} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>
                  <Pencil size={16} />
                </button>
              </div>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type="text"
                  placeholder="ENTER OTP"
                  value={props.otp}
                  onChange={e => props.setOtp(e.target.value.replace(/\D/g, ""))}
                  className="input-field"
                  maxLength={6}
                  inputMode="numeric"
                  style={{ letterSpacing: "10px", width: "100%" }}
                  autoComplete="one-time-code"
                />
              </div>
              <button
                className="btn-primary btn-full"
                disabled={props.loading || props.otp.length < 4}
                onClick={props.onVerifyOtp}
                style={{ marginBottom: 12 }}
              >
                {props.loading ? "VERIFYING…" : "VERIFY CODE"}
              </button>
              <button
                onClick={props.onSendOtp}
                className="opacity-70 hover:opacity-100 transition-opacity"
                style={{ background: "none", border: "none", color: "white", padding: "10px", marginTop: "12px" }}
                title="RESEND OTP"
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <RefreshCw size={24} className={props.loading ? "animate-spin" : ""} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em" }}>RESEND</span>
                </div>
              </button>
            </>
          )}
          {props.screen === "register" && (
            <>
              <input 
                type="text" 
                placeholder="Your full name" 
                value={props.userName === "Test" || props.userName === "Test User" ? "" : props.userName} 
                onChange={e => props.setUserName(e.target.value)} 
                className="input-field" 
                autoFocus 
              />
              <button className="btn-primary btn-full" disabled={props.loading || !props.userName.trim() || props.userName.length < 3} onClick={props.onSaveUser}>
                START PLAYING
              </button>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 12, fontStyle: "italic", textAlign: "center" }}>
                You might just make it to the pages of TOI!
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────── Result Screen ─────────────── */
function ResultScreen({ scoreData, userName, onShare, trophyRef }: {
  scoreData: ScoreData; userName: string; onShare: () => void; trophyRef: React.RefObject<HTMLDivElement | null>;
}) {
  const stats = [
    { label: "SOLVED IN", value: `${scoreData.timeTaken}s`, icon: Clock },
    { label: "YOUR SCORE", value: scoreData.score, icon: Zap },
    { label: "TOTAL FLIP", value: scoreData.totalFlips, icon: RotateCcw },
    { label: "WIN", value: `${scoreData.winRate}%`, icon: CheckCircle2 },
    { label: "LIVE STREAK", value: scoreData.streak, icon: Flame },
    { label: "BEST STREAK", value: scoreData.bestStreak, icon: Star },
  ];

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="screen-container"
      style={{ justifyContent: "center", padding: "24px" }}
    >
      <div className="result-card" style={{ marginBottom: 32, textAlign: "center", boxShadow: "0 25px 50px rgba(0,0,0,0.3)", backgroundColor: "#F17660", borderRadius: "32px", padding: "32px 24px" }}>
        {/* Logo inside card is good for the shareable asset */}
        <div style={{ marginBottom: 20 }}>
          <img src="/logo_transparent.png" alt="TOI Logo" style={{ height: 48, width: "auto" }} />
        </div>
        <h3 style={{ fontSize: 36, fontWeight: 900, marginBottom: 4, fontFamily: "var(--font-outfit), sans-serif", color: "#540000" }}>{userName}'s Flipped it</h3>
        <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color: "#540000", opacity: 0.8 }}>i flipped it how about you?</p>

        <div className="stat-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {stats.map((s, i) => (
            <div key={i} className="stat-box" style={{ minHeight: "110px", padding: "18px", backgroundColor: "#540000", borderRadius: "12px", color: "white" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <s.icon size={18} color="#fff" style={{ opacity: 0.6 }} />
                <span className="label" style={{ fontSize: 13, letterSpacing: "0.12em", fontWeight: 700 }}>{s.label}</span>
              </div>
              <div className="value" style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.1 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 10, textAlign: "center" }}>
        <p style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {scoreData.msgTop}
        </p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 20, lineHeight: 1.5 }}>
          {scoreData.msgBottom}
        </p>
        <button className="btn-primary btn-full" onClick={onShare} style={{ padding: "20px", fontSize: 18, borderRadius: "12px" }}>
          <Share2 size={20} style={{ marginRight: 10 }} /> SHARE SCORE
        </button>
      </div>
    </motion.div>
  );
}

/* ─────────────── Main Shell ─────────────── */
export default function FlippitApp() {
  const { isDebug, debugParam, isLocal, setIsDebug } = useDebugMode();

  const [screen, setScreen] = useState<Screen>("splash");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [userName, setUserName] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isClient, setIsClient] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [sessionData, setSessionData] = useState<UserSession | null>(null);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  // Sync debug state from URL and handle Geolocation
  useEffect(() => {
    if (debugParam && !isDebug) setIsDebug(true);
    if (isClient && !isDebug) {
      navigator.geolocation.getCurrentPosition(
        () => { /* handled */ },
        () => { /* silent */ }
      );
    }
  }, [debugParam, setIsDebug, isClient, isDebug]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const trophyRef = useRef<HTMLDivElement>(null);
  const gameId = "eec36aba";

  const stopTimer = useCallback(() => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const onPuzzleComplete = useCallback(async (data: { id: string; score: number; timeTaken: number }) => {
    stopTimer();
    const timeSpent = data.timeTaken || Math.max(0, 60 - timeLeft);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    // Formula for 100-point scale: Base 100 points minus time penalty
    const timePenalty = (timeSpent / 60) * 100;
    const finalScore = Math.min(100, Math.max(0, Math.round(110 - timePenalty))); // Slight buffer for high scores

    const rank = finalScore >= 80 ? "GOLD" : finalScore >= 50 ? "SILVER" : "BRONZE";
    const winRate = Math.min(100, Math.round(100 - (timeSpent / 60) * 15)); // Adjusted for performance perception

    // Legacy Message Rules
    let msgTop = "You nailed it!";
    if (timeSpent <= 20) msgTop = "Fastest finger in town!";
    else if (timeSpent <= 35) msgTop = "You’re on fire!";
    else if (timeSpent <= 50) msgTop = "You crushed it!";
    else if (timeSpent <= 60) msgTop = "Mission accomplished!";

    const msgBottomArray = [
      "Great flip! Another one lands tomorrow. Until then, enjoy the rest of today’s paper.",
      "Well played! A fresh flip awaits tomorrow. For now, keep going through today’s newspaper.",
      "Nice work! Tomorrow brings a new challenge. Until then, flip through today’s edition.",
      "Smooth finish! Another puzzle drops tomorrow. Meanwhile, dive back into today’s paper.",
      "You aced it! Come back for tomorrow’s flip. Until then, carry on with today’s reading.",
      "Flip mastered! A new one arrives tomorrow. For now, enjoy the rest of today’s newspaper."
    ];
    const msgBottom = msgBottomArray[Math.floor(Math.random() * msgBottomArray.length)];

    const sd = {
      score: finalScore,
      timeTaken: timeSpent,
      streak: 1,
      bestStreak: 1,
      accuracy: winRate,
      totalFlips: data.score,
      winRate,
      rank,
      msgTop,
      msgBottom
    };
    setScoreData(sd);

    if (sessionData) {
      const city = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("code") || "UNKNOWN" : "UNKNOWN";
      await flippitApi.saveGame({
        g_id: data.id,
        user_id: sessionData.id,
        city,
        status: "completed",
        score: finalScore,
        time_taken: timeSpent
      }, sessionData.token, isDebug);

      try {
        await flippitApi.getUserStats(sessionData.id, isDebug);
      } catch (e) { }
    }
    setScreen("result");
  }, [stopTimer, timeLeft, sessionData, isDebug]);

  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(60);
    timerRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) {
          stopTimer();
          onPuzzleComplete({ id: gameId, score: 0, timeTaken: 60 });
          return 0;
        }
        return p - 1;
      });
    }, 1000);
  }, [stopTimer, onPuzzleComplete, gameId]);

  const handleSendOtp = async () => {
    if (mobile.length < 10) return;
    setScreen("otp");
    try {
      await fetch("/api/otp/send", {
        method: "POST",
        body: JSON.stringify({ phone: mobile }),
      });
    } catch { }
  };

  // FALLBACK POLLING: If the iframe doesn't send a message, we check the server
  useEffect(() => {
    if (screen === "game" && sessionData && !isDebug) {
      const poll = setInterval(async () => {
        try {
          const stats = await flippitApi.getUserStats(sessionData.id, false);
          const todayIST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
          const completed = stats.gameLogs?.find((l: GameLog) => {
            const logDateIST = new Date(l.created_at).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
            return l.status === "completed" && logDateIST === todayIST && l.g_id === gameId;
          });
          if (completed) {
            clearInterval(poll);
            onPuzzleComplete({ id: gameId, score: completed.score, timeTaken: completed.time_taken });
          }
        } catch (e) {
          console.error("Poll Error", e);
        }
      }, 5000);
      return () => clearInterval(poll);
    }
  }, [screen, sessionData, isDebug, onPuzzleComplete, gameId]);

  const [sharing, setSharing] = useState(false);
  const handleShare = async () => {
    if (!trophyRef.current || sharing) return;
    setSharing(true);
    try {
      // Capture the high-res card
      const canvas = await html2canvas(trophyRef.current, {
        useCORS: true,
        scale: 3, // High quality
        logging: false,
        backgroundColor: null // Let the card's own background show
      });

      canvas.toBlob(async blob => {
        if (!blob) { setSharing(false); return; }
        const file = new File([blob], `flippit-${userName || "score"}.png`, { type: "image/png" });

        try {
          if (navigator.share && navigator.canShare?.({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "Flipped It!",
              text: `Check out my score on TOI Flippit! I flipped it in ${scoreData?.timeTaken}s.`
            });
          } else {
            // Standard Download Fallback
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `flippit-${userName || "score"}.png`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(link.href), 100);
          }
        } catch (err) {
          console.error("Share failed", err);
        } finally {
          setSharing(false);
        }
      }, "image/png");
    } catch (e) {
      console.error("Error generating card", e);
      setSharing(false);
      alert("SORRY, UNABLE TO GENERATE SHARE CARD. PLEASE TRY AGAIN.");
    }
  };

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("session");
    if (debugParam) {
      setIsDebug(true);
    }
    if (saved) {
      const d = JSON.parse(saved);
      setSessionData(d);
      if (d.name) setUserName(d.name);
    }
  }, [debugParam, isLocal, setIsDebug]);

  if (!isClient) return null;

  return (
    <div id="app-shell" style={{ 
      height: "100dvh", 
      width: "100%", 
      overflow: "hidden", 
      position: "fixed", 
      inset: 0,
      background: "var(--brand-red)",
      display: "flex",
      flexDirection: "column"
    }}>
      {screen === "result" && scoreData && (
        <TrophyCard
          ref={trophyRef}
          userName={userName}
          score={scoreData.score}
          timeTaken={scoreData.timeTaken}
          totalFlips={scoreData.totalFlips}
          winRate={scoreData.winRate}
          streak={scoreData.streak}
          bestStreak={scoreData.bestStreak}
        />
      )}
      {/* Unified Global Header - Consistency across all pages save Splash */}
      {screen !== "splash" && (
        <div style={{ 
          width: "100%", 
          padding: "16px 20px",
          paddingTop: screen === "game" ? "16px" : "40px",
          display: "flex", 
          justifyContent: screen === "game" ? "space-between" : "center", 
          alignItems: "center",
          background: screen === "game" ? "#E31E24" : "transparent",
          borderBottom: screen === "game" ? "2px solid #8B0000" : "none",
          zIndex: 1000,
          flexShrink: 0,
          boxSizing: "border-box"
        }}>
          <img 
            src="/logo_transparent.png" 
            alt="TOI Logo" 
            style={{ 
              height: screen === "game" ? "56px" : "80px", // Even larger for premium feel
              width: "auto",
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))"
            }} 
          />
          
          {screen === "game" && (
            <motion.div 
              animate={timeLeft <= 10 ? { 
                scale: [1, 1.05, 1],
                backgroundColor: ["#540000", "#9d071c", "#540000"]
              } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                color: "#FFF",
                background: "#540000",
                padding: "6px 12px",
                borderRadius: "14px",
                border: "1.5px solid rgba(255,255,255,0.25)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.3)"
              }}
            >
              <Timer size={22} strokeWidth={3} className={timeLeft <= 10 ? "animate-pulse" : ""} />
              <span style={{ 
                fontSize: "24px", 
                fontWeight: 900, 
                lineHeight: 1, 
                minWidth: "40px", 
                fontFamily: "var(--font-outfit), sans-serif",
                textAlign: "center"
              }}>{timeLeft}s</span>
            </motion.div>
          )}
        </div>
      )}

        <AnimatePresence mode="wait">
          {screen === "splash" && (
            <SplashScreen 
              onStart={async () => {
                const saved = typeof window !== "undefined" ? localStorage.getItem("session") : null;
                if (!saved) {
                  console.log("🔒 [LOCK] No session found. Going to login.");
                  setScreen("login");
                } else {
                  const d = JSON.parse(saved);
                  if (!d.id || !d.token) {
                    console.log("🔒 [LOCK] Malformed session. Going to login.");
                    setScreen("login");
                    return;
                  }
                  
                  try {
                    setLoading(true);
                    const todayIST = getISTDateString();
                    console.log(`🔒 [LOCK] Checking daily lock for user: ${d.id} | Today (IST): ${todayIST}`);
                    
                    const stats = await flippitApi.getUserStats(d.id, isDebug);
                    console.log("🔒 [LOCK] Raw data received:", JSON.stringify(stats, null, 2));
                    
                    // Exhaustive log extraction covering multiple possible API response structures
                    const logs = stats.gameLogs || stats.data?.gameLogs || stats.data?.data?.gameLogs || stats.logs || [];
                    console.log(`🔒 [LOCK] Analyzing ${logs.length} total logs...`);
                    
                    let alreadyPlayed = null;
                    for (const log of logs) {
                      const logDateIST = getISTDateString(log.created_at || log.Date || log.timestamp || log.updated_at);
                      const logStatus = (log.status || log.Status || "completed").toLowerCase(); // Default to completed if score exists
                      const logScore = Number(log.score || log.Score || 0);

                      console.log(`   - Log item: Date=${logDateIST}, Status=${logStatus}, Score=${logScore}`);

                      // If match found for today and it's a valid attempt (success/completed)
                      if ((logStatus === "completed" || logStatus === "success") && logDateIST === todayIST) {
                        alreadyPlayed = log;
                        break;
                      }
                    }
                    
                    if (alreadyPlayed) {
                      console.log("🔒 [LOCK] MATCH DETECTED. Forcing redirect to Result Screen.");
                      setScoreData({
                        score: alreadyPlayed.score || 0,
                        timeTaken: alreadyPlayed.time_taken || alreadyPlayed.TimeTaken || 0,
                        streak: stats.streak || stats.data?.streak || 1,
                        bestStreak: stats.bestStreak || stats.data?.bestStreak || 1,
                        accuracy: 100,
                        totalFlips: alreadyPlayed.score > 0 ? Math.round(alreadyPlayed.score / 10) : 0,
                        winRate: 100,
                        rank: (alreadyPlayed.score || 0) >= 80 ? "GOLD" : ((alreadyPlayed.score || 0) >= 50 ? "SILVER" : "BRONZE"),
                        msgTop: "STILL GOING STRONG!",
                        msgBottom: "You've already flipped it today. Come back tomorrow for a fresh challenge!"
                      });
                      setScreen("result");
                    } else {
                      console.log("🔒 [LOCK] NO TODAY LOG FOUND. Allowed to play.");
                      if (!d.name || d.name === "Test" || d.name === "Test User") {
                        setScreen("register");
                      } else {
                        setScreen("game");
                      }
                    }
                  } catch (e) {
                    console.error("🔒 [LOCK] API Error during verification:", e);
                    setScreen("game"); // Safe fallback if API is unreachable
                  } finally {
                    setLoading(false);
                  }
                }
              }} 
              onHow={() => setShowHow(true)} 
            />
          )}

          {(screen === "login" || screen === "otp" || screen === "register") && (
            <AuthScreen
              screen={screen} mobile={mobile} otp={otp} userName={userName} loading={loading}
              setMobile={setMobile} setOtp={setOtp} setUserName={setUserName}
              onSendOtp={async () => { 
                console.log("🚀 [Client] onSendOtp triggered for:", mobile);
                setLoading(true); 
                try { 
                  const res = await flippitApi.sendOtp(mobile, isDebug); 
                  console.log("🚀 [Client] sendOtp Response:", res);
                  if (res.error) throw new Error(res.error);
                  setScreen("otp"); 
                } catch (e: any) {
                  console.error("🚀 [Client] OTP Error:", e.message);
                  alert(`OTP DELIVERY FAILED: ${e.message}\n\nPlease check your terminal logs for details.`);
                } finally { 
                  setLoading(false); 
                } 
              }}
              onVerifyOtp={async () => {
                console.log("🚀 [Client] onVerifyOtp triggered");
                setLoading(true); 
                try {
                  const res = await flippitApi.verifyOtp(mobile, otp, isDebug);
                  console.log("🚀 [Client] verifyOtp Response:", res);
                  
                  if (!res || !res.UserId || !res.token) {
                    throw new Error(res?.error || res?.message || "Invalid OTP");
                  }
                  
                  const s = { id: res.UserId, name: res.UserName, token: res.token };
                  localStorage.setItem("session", JSON.stringify(s)); 
                  setSessionData(s);

                  try {
                    const todayIST = getISTDateString();
                    console.log(`🔒 [LOCK-POST-OTP] Verifying lock for user: ${s.id} | Today: ${todayIST}`);
                    const stats = await flippitApi.getUserStats(s.id, isDebug);
                    console.log("🔒 [LOCK-POST-OTP] Raw Data:", JSON.stringify(stats, null, 2));
                    
                    const logs = stats.gameLogs || stats.data?.gameLogs || stats.data?.data?.gameLogs || stats.logs || [];
                    let alreadyPlayed = null;
                    for (const log of logs) {
                      const logDateIST = getISTDateString(log.created_at || log.Date || log.timestamp || log.updated_at);
                      const logStatus = (log.status || log.Status || "completed").toLowerCase();
                      if ((logStatus === "completed" || logStatus === "success") && logDateIST === todayIST) {
                        alreadyPlayed = log;
                        break;
                      }
                    }

                    if (alreadyPlayed) {
                      console.log("🔒 [LOCK-POST-OTP] DAILY LOCK TRIGGERED. Redirecting to Result.");
                      setScoreData({
                        score: alreadyPlayed.score || 0,
                        timeTaken: alreadyPlayed.time_taken || alreadyPlayed.TimeTaken || 0,
                        streak: stats.streak || stats.data?.streak || 1,
                        bestStreak: stats.bestStreak || stats.data?.bestStreak || 1,
                        accuracy: 100,
                        totalFlips: alreadyPlayed.score > 0 ? Math.round(alreadyPlayed.score / 10) : 0,
                        winRate: 100,
                        rank: (alreadyPlayed.score || 0) >= 80 ? "GOLD" : ((alreadyPlayed.score || 0) >= 50 ? "SILVER" : "BRONZE"),
                        msgTop: "STILL GOING STRONG!",
                        msgBottom: "You've already flipped it today. See you tomorrow!"
                      });
                      setScreen("result");
                      return; 
                    }
                    console.log("🔒 [LOCK-POST-OTP] No locks found. Good to go.");
                  } catch (e) {
                    console.error("🔒 [LOCK-POST-OTP] LOG READ ERROR:", e);
                  }
                  
                  if (res.UserName && res.UserName !== "Test" && res.UserName !== "Test User") {
                    setUserName(res.UserName);
                    setScreen("game");
                  } else {
                    setScreen("register");
                  }
                } catch (e: any) {
                  console.error("🚀 [Client] Verify Error:", e.message);
                  alert(`VERIFICATION FAILED: ${e.message}`);
                } finally { setLoading(false); }
              }}
              onSaveUser={async () => { 
                setLoading(true); 
                try { 
                  await flippitApi.saveUser(userName, sessionData!.token, isDebug); 
                  const s = { ...sessionData!, name: userName }; 
                  localStorage.setItem("session", JSON.stringify(s)); 
                  setSessionData(s); 
                  setScreen("game"); 
                } catch (e: any) {
                  console.error("🚀 [Client] Save User Error:", e.message);
                  alert(`REGISTRATION FAILED: ${e.message}`);
                } finally { 
                  setLoading(false); 
                } 
              }}
              onBack={() => setScreen("login")}
            />
          )}

          {screen === "game" && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                background: "var(--brand-red)",
                overflow: "hidden"
              }}
            >

              <div style={{ padding: "6px 24px", textAlign: "center", background: "rgba(0,0,0,0.15)" }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em" }}>PLAYING AS: {userName?.toUpperCase()}</span>
              </div>
              <div style={{ 
                flex: 1, 
                padding: "12px", 
                minHeight: 0, 
                overflow: "hidden", 
                position: "relative",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{ 
                  flex: 1, 
                  background: "white", 
                  borderRadius: "24px", 
                  overflow: "hidden", 
                  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}>
                  <GameContainer
                    key={gameKey}
                    uid={sessionData?.id || "guest"}
                    gameId={gameId}
                    onPuzzleLoad={startTimer}
                    onPuzzleComplete={onPuzzleComplete}
                    onPuzzleExpired={() => setScreen("expired")}
                    debug={isDebug}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {screen === "result" && scoreData && (
            <ResultScreen 
              scoreData={scoreData} 
              userName={userName} 
              onShare={handleShare} 
              trophyRef={trophyRef} 
            />
          )}

          {screen === "expired" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="screen-container">
              <Clock size={64} color="white" style={{ marginBottom: 24 }} />
              <div><h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>EXPIRED</h2><p style={{ color: "rgba(255,255,255,0.6)" }}>This puzzle is no longer live. Come back tomorrow!</p></div>
              <button className="btn-primary" style={{ marginTop: 32 }} onClick={() => setScreen("splash")}>BACK HOME</button>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>{showHow && <HowToPlay onClose={() => setShowHow(false)} />}</AnimatePresence>
      </div>
  );
}
