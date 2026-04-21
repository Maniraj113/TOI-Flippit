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



/* ─────────────── CRITICAL HELPER — IST Date ─────────────── */
// This function was missing before — it caused a ReferenceError crash
// on every splash screen "Let's Start" click (Scenario C & D both failed).
function getISTDateString(isoString?: string): string {
  const date = isoString ? new Date(isoString) : new Date();
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/* ─────────────── Rank Helper ─────────────── */
function getrank(score: number): string {
  if (score >= 80) return "GOLD";
  if (score >= 50) return "SILVER";
  return "BRONZE";
}

// Use a dynamic ID based on date to avoid duplicate save collisions in the backend
const getTodayId = () => {
  const now = new Date();
  const istDate = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const dateStr = istDate.toISOString().split('T')[0].replace(/-/g, '');
  return `flippit_${dateStr}`;
};

const INITIAL_GAME_ID = getTodayId();

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
          LET&apos;S START
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
          LET&apos;S START
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
function ResultScreen({ scoreData, userName, onShare, sharing }: {
  scoreData: ScoreData; userName: string; onShare: () => void; sharing: boolean;
}) {
  const stats = [
    { label: "SOLVED IN", value: `${scoreData.timeTaken}`, icon: Clock, color: "#FFFFFF" },
    { label: "YOUR SCORE", value: scoreData.score, icon: Zap, color: "#FFD700" },
    { label: "TOTAL FLIP", value: scoreData.totalFlips, icon: RotateCcw, color: "#FFFFFF" },
    { label: "WIN", value: `${scoreData.winRate}%`, icon: CheckCircle2, color: "#4ADE80" },
    { label: "LIVE STREAK", value: scoreData.streak, icon: Flame, color: "#FB923C" },
    { label: "BEST STREAK", value: scoreData.bestStreak, icon: Star, color: "#FDE047" },
  ];

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#990000",
        overflow: "hidden",
        padding: "20px 0"
      }}
    >
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        {/* Large Branding Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo_transparent.png" alt="TOI Logo" style={{ height: 80, width: "auto", marginBottom: 12 }} />

        {/* Celebratory Message (Restored at Top) */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "white", textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1 }}>
            {scoreData.msgTop}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 700, marginTop: 4 }}>
            {scoreData.msgBottom}
          </div>
        </div>

        {/* The Salmon Center Card */}
        <div style={{
          width: "100%",
          maxWidth: 380,
          background: "#F17660",
          borderRadius: 40,
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
        }}>
          <div style={{ textAlign: "center" }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 800,
              color: "rgba(84, 0, 0, 0.6)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 4,
            }}>
              {userName}&apos;s Result
            </h3>
            <h2 style={{
              fontSize: 24,
              fontWeight: 900,
              color: "#540000",
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 4,
            }}>
              I FLIPPED IT.<br />HOW ABOUT YOU?
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12
          }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                background: "#540000",
                borderRadius: 16,
                padding: "16px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                color: "white",
                position: "relative",
                minHeight: 100
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.7, marginBottom: 8, letterSpacing: "0.05em" }}>{s.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                  <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                  {s.label === "SOLVED IN" && <span style={{ fontSize: 10, opacity: 0.5 }}>secs</span>}
                  {s.label === "YOUR SCORE" && <span style={{ fontSize: 10, opacity: 0.5 }}>/100</span>}
                </div>
                <div style={{ position: "absolute", bottom: 12, right: 10 }}>
                  <s.icon size={22} color={s.color || "rgba(255,255,255,0.7)"} />
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn-primary"
            onClick={onShare}
            disabled={sharing}
            style={{
              padding: "16px",
              fontSize: 16,
              borderRadius: 20,
              background: "#540000",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              fontWeight: 800,
              border: "none",
              boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
            }}
          >
            <Share2 size={20} /> {sharing ? "SHARING..." : "SHARE SCORE"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────── Main Shell ─────────────── */
export default function FlippitApp() {
  const { isDebug, debugParam, setIsDebug } = useDebugMode();

  const [screen, setScreen] = useState<Screen>("splash");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);

  // To avoid hydration mismatches, we ensure the initial render matches the server.
  const [isMounted, setIsMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setIsMounted(true), []);

  const [showHow, setShowHow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [sharing, setSharing] = useState(false);

  const SESSION_KEY = "flippit_v2_session";

  const [sessionData, setSessionData] = useState<UserSession | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const d = JSON.parse(saved) as UserSession;
        // CRITICAL: Reject legacy test or malformed IDs
        if (!d.id || d.id.startsWith("test-") || d.id === "debug-user") {
          localStorage.removeItem(SESSION_KEY);
          return null;
        }
        return d;
      }
    } catch { /* ignore */ }
    return null;
  });

  const [userName, setUserName] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const d = JSON.parse(saved) as UserSession;
        if (d.name && d.name !== "Test" && d.name !== "Test User") {
          return d.name;
        }
      }
    } catch { /* ignore */ }
    return "";
  });

  const [scoreData, setScoreData] = useState<ScoreData | null>(null);

  const [gameId, setGameId] = useState(INITIAL_GAME_ID);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // Use a ref for timeLeft so onPuzzleComplete doesn't recreate every second
  const isCompleteRef = useRef(false);
  const timeLeftRef = useRef(60);
  const trophyRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<UserSession | null>(null);

  // Sync debug from URL
  useEffect(() => {
    if (debugParam && !isDebug) setIsDebug(true);
  }, [debugParam, setIsDebug, isDebug]);

  // Sync sessionRef with the lazy-initialized sessionData (once on mount)
  // sessionRef is used in callbacks to avoid stale closures
  useEffect(() => {
    sessionRef.current = sessionData;
  }, [sessionData]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // ─── CORE: Puzzle Complete Handler ───
  // FIX: Uses timeLeftRef instead of timeLeft state to avoid stale closure
  // and prevent onPuzzleComplete from being recreated every second.
  const onPuzzleComplete = useCallback(async (data: { id: string; score: number; timeTaken: number }) => {
    if (isCompleteRef.current) return;
    isCompleteRef.current = true;
    
    stopTimer();
    const timeSpent = data.timeTaken > 0 ? data.timeTaken : Math.max(1, 60 - timeLeftRef.current);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    // Score: 100-point scale (speed-based)
    const timePenalty = (timeSpent / 60) * 100;
    const finalScore = Math.min(100, Math.max(0, Math.round(110 - timePenalty)));

    if (isDebug) {
      console.log("[ResultDebug] data received:", data);
      console.log("[ResultDebug] timeLeftRef at end:", timeLeftRef.current);
      console.log("[ResultDebug] Calculated timeSpent:", timeSpent);
      console.log("[ResultDebug] Calculated finalScore:", finalScore);
    }

    // Win Rate: as per spec — 100 - (timeSpent / 60) * 10
    const winRate = Math.min(100, Math.round(100 - (timeSpent / 60) * 10));

    const rank = getrank(finalScore);

    // Celebratory message based on speed
    let msgTop = "You nailed it!";
    if (timeSpent <= 15) msgTop = "Fastest finger in town!";
    else if (timeSpent <= 30) msgTop = "You're on fire!";
    else if (timeSpent <= 45) msgTop = "You crushed it!";
    else msgTop = "Mission accomplished!";

    const msgBottomArray = [
      "Great flip! Another one lands tomorrow. Until then, enjoy the rest of today's paper.",
      "Well played! A fresh flip awaits tomorrow. For now, keep going through today's newspaper.",
      "Nice work! Tomorrow brings a new challenge. Until then, flip through today's edition.",
      "Smooth finish! Another puzzle drops tomorrow. Meanwhile, dive back into today's paper.",
      "You aced it! Come back for tomorrow's flip. Until then, carry on with today's reading.",
      "Flip mastered! A new one arrives tomorrow. For now, enjoy the rest of today's newspaper."
    ];
    const msgBottom = msgBottomArray[Math.floor(Math.random() * msgBottomArray.length)];

    const sd: ScoreData = {
      score: finalScore,
      timeTaken: timeSpent,
      streak: 1,
      bestStreak: 1,
      accuracy: winRate,
      totalFlips: data.score > 0 ? data.score : Math.max(1, Math.round(finalScore / 10)),
      winRate,
      rank,
      msgTop,
      msgBottom
    };
    setScoreData(sd);

    const session = sessionRef.current;
    if (session?.token) {
      // PROOF-FIX: Use session.id (Hash ID) explicitly to match log fetching expectations.
      // Preference for numericId was causing the redirection loop (saving to numeric partition, fetching from hash partition).
      const apiRes = await flippitApi.saveGame({
        g_id: String(data.id),
        user_id: String(session.id),
        time_taken: Number(timeSpent),
        score: Number(finalScore),
        status: "completed",
        city: "TOIIN" 
      }, session.token, isDebug);
      console.log("[API] saveGame response:", apiRes);
    }

    setScreen("result");
  }, [stopTimer, isDebug, setScoreData, setScreen]);

  const startTimer = useCallback(() => {
    isCompleteRef.current = false;
    stopTimer();
    setTimeLeft(60);
    timeLeftRef.current = 60;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        timeLeftRef.current = next;
        if (next <= 0) {
          stopTimer();
          onPuzzleComplete({ id: gameId, score: 0, timeTaken: 60 });
          return 0;
        }
        return next;
      });
    }, 1000);
  }, [stopTimer, onPuzzleComplete]);

  const handlePuzzleLoad = useCallback((id: string) => {
    console.log("Puzzle loaded:", id);
    if (id && id !== "undefined") {
      setGameId(id);
      startTimer();
    }
  }, [startTimer]);

  // Stable onPuzzleExpired so GameContainer doesn't re-render
  const handleExpired = useCallback((id: string) => {
    console.warn("Puzzle expired:", id);
    setScreen("expired");
  }, []);

  // Removed the fallback polling that was causing 404 spam.
  // AmuseLabs iframe integration is robust enough via PUZZLE_COMPLETE event.

  // ─── SHARE HANDLER ───
  const handleShare = async () => {
    if (!trophyRef.current || sharing) return;
    setSharing(true);
    try {
      const canvas = await html2canvas(trophyRef.current, {
        useCORS: true,
        scale: 2, // Scale 2 is enough for 1080p and more stable
        logging: false,
        backgroundColor: "#990000",
        width: 1080,
        height: 1080,
        windowWidth: 1080,
        windowHeight: 1080,
        onclone: (clonedDoc) => {
          // Ensure the capture element is visible in the clone
          const el = clonedDoc.getElementById("capture-card");
          if (el) {
            el.style.left = "0";
            el.style.position = "relative";
          }
        }
      });

      canvas.toBlob(async blob => {
        if (!blob) { setSharing(false); return; }
        const file = new File([blob], `flippit-${userName || "score"}.png`, { type: "image/png" });
        try {
          if (navigator.share && navigator.canShare?.({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "Flipped It!",
              text: `Check out my score on TOI Flippit! I solved it in ${scoreData?.timeTaken}s.`
            });
          } else {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `flippit-${userName || "score"}.png`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(link.href), 100);
          }
        } catch (shareErr: any) {
          console.error("Share failed:", shareErr);
          // Fallback to download on ANY error (Abort, Security, Unsupported)
          // except for real intentional Cancels if we can detect them
          if (shareErr.name !== "AbortError") {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `flippit-${userName || "score"}.png`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(link.href), 1000);
          } else {
            console.log("User cancelled share or browser aborted.");
          }
        } finally {
          setSharing(false);
        }
      }, "image/png");
    } catch (canvasErr) {
      console.error("Error generating share card:", canvasErr);
      setSharing(false);
      alert("SORRY, UNABLE TO GENERATE SHARE CARD. PLEASE TRY AGAIN.");
    }
  };

  // ─── DAILY LOCK CHECK (shared logic for both Splash & Post-OTP) ───
  const checkDailyLockAndRedirect = useCallback(async (
    userId: string,
    token: string,
    onAlreadyPlayed: (log: GameLog, stats: Record<string, unknown>) => void,
    onNotPlayed: () => void
  ) => {
    const todayIST = getISTDateString();
    let stats;
    try {
      stats = await flippitApi.getUserStats(userId, isDebug, token);
      console.log("🔒 [LOCK] Raw data:", stats);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("401")) {
        // Token is invalid/expired. Log user out.
        console.error("🔒 [LOCK] 401 Unauthorized! Token expired. Logging out.");
        localStorage.removeItem(SESSION_KEY);
        window.location.reload();
        return;
      }
      stats = {}; // fallback
    }

    // DEEP DEBUG: Log the full structure to help resolve the "0 logs" issue
    console.log("🔒 [LOCK] STATS KEYS:", Object.keys(stats));
    if (stats.data) console.log("🔒 [LOCK] DATA KEYS:", Object.keys(stats.data));

    const allLogs: GameLog[] = stats.gameLogs || stats.data?.gameLogs || stats.data?.data?.gameLogs || stats.logs || [];
    console.log(`🔒 [LOCK] Analyzing ${allLogs.length} total logs... (Source: ${allLogs === stats.gameLogs ? 'root' : 'nested'})`);

    let alreadyPlayed: GameLog | null = null;
    for (const log of allLogs) {
      const logDateIST = getISTDateString(log.created_at);
      const logStatus = (log.status || "").toLowerCase();
      console.log(`   - Log: Date=${logDateIST}, Status=${logStatus}, Score=${log.score}`);

      // LOCKING on 'completed', 'success', 'pending' or 'expired' to ensure single daily attempt.
      const isCompleted = logStatus === "completed" || logStatus === "success" || logStatus === "pending";
      const isExpired = logStatus === "expired" || logStatus === "failure";

      if ((isCompleted || isExpired) && logDateIST === todayIST) {
        alreadyPlayed = log;
        break;
      }
    }

    if (alreadyPlayed) {
      console.log("🔒 [LOCK] MATCH DETECTED. Forcing redirect to Result Screen.");
      onAlreadyPlayed(alreadyPlayed, stats as Record<string, unknown>);
    } else {
      console.log("🔒 [LOCK] No lock found. Allowing play.");
      onNotPlayed();
    }
  }, [isDebug]); // Wrap in useCallback for stability

  function buildLockedScoreData(log: GameLog, stats: Record<string, unknown>, msgBottom: string): ScoreData {
    const score = Number(log.score) || 0;
    return {
      score,
      timeTaken: Number(log.time_taken) || 0,
      streak: Number((stats as Record<string, number>).streak) || 1,
      bestStreak: Number((stats as Record<string, number>).bestStreak) || 1,
      accuracy: 100,
      totalFlips: score > 0 ? Math.round(score / 10) : 0,
      winRate: 100,
      rank: getrank(score),
      msgTop: "STILL GOING STRONG!",
      msgBottom,
    };
  }

  // Return null until mounted to completely avoid server/client hydration mismatches.
  // Since sessionData reads from localStorage, the initial JSX could differ from SSR.
  if (!isMounted) return null;

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
      {/* TrophyCard: off-screen hidden element for html2canvas capture */}
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

      {/* ─── GENERIC HEADER (For Game & Other Screens) ─── */}
      {screen !== "splash" && screen !== "result" && (
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo_transparent.png"
            alt="TOI Logo"
            style={{
              height: screen === "game" ? "64px" : "120px", // Increased logo dimensions fundamentally
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
              const saved = typeof window !== "undefined" ? localStorage.getItem(SESSION_KEY) : null;
              if (!saved) {
                setScreen("login");
                return;
              }

              let d: UserSession;
              try {
                d = JSON.parse(saved);
              } catch {
                localStorage.removeItem(SESSION_KEY);
                setScreen("login");
                return;
              }

              if (!d.id || !d.token) {
                localStorage.removeItem(SESSION_KEY);
                setScreen("login");
                return;
              }

              try {
                setLoading(true);
                // Silent check to skip OTP for returning users
                // BUT we still wait for them to click "Let's Start"
                await checkDailyLockAndRedirect(
                  d.id,
                  d.token,
                  (log, stats) => {
                    setUserName(d.name || "Player");
                    setScoreData(buildLockedScoreData(log, stats, "You've already flipped it today. See you tomorrow!"));
                    setScreen("result");
                  },
                  () => {
                    // Not played today - move to game
                    setUserName(d.name || "Player");
                    setScreen("game");
                    setGameKey(k => k + 1);
                  }
                );
              } catch (lockErr) {
                console.error("🔒 [LOCK] Session expired or API error. Falling back to login.", lockErr);
                setScreen("login");
              } finally {
                setLoading(false);
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
              console.log("🚀 [OTP] Sending for:", mobile);
              setLoading(true);
              try {
                const res = await flippitApi.sendOtp(mobile, isDebug);
                console.log("🚀 [OTP] Send response:", res);
                if (res.error) throw new Error(res.error);
                setScreen("otp");
              } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Unknown error";
                console.error("🚀 [OTP] Send error:", msg);
                alert(`OTP DELIVERY FAILED: ${msg}\n\nPlease check your terminal logs.`);
              } finally {
                setLoading(false);
              }
            }}
            onVerifyOtp={async () => {
              console.log("🚀 [OTP] Verifying...");
              setLoading(true);
              try {
                const res = await flippitApi.verifyOtp(mobile, otp, isDebug);
                console.log("🚀 [OTP] Verify response:", res);

                if (!res || !res.UserId || !res.token) {
                  throw new Error(res?.error || res?.message || "Invalid OTP or server error.");
                }

                // Null-safe name (new users may not have a name yet)
                const s: UserSession = {
                  id: res.UserId,
                  name: res.UserName || "",
                  token: res.token
                };
                localStorage.setItem(SESSION_KEY, JSON.stringify(s));
                setSessionData(s);
                sessionRef.current = s;

                // Scenario D: Post-OTP daily lock check (catches incognito returns)
                try {
                  await checkDailyLockAndRedirect(
                    s.id,
                    s.token,
                    (log, stats) => {
                      if (res.UserName && res.UserName !== "Test") {
                        setUserName(res.UserName);
                      }
                      setScoreData(buildLockedScoreData(
                        log,
                        stats,
                        "You've already flipped it today. See you tomorrow!"
                      ));
                      setScreen("result");
                    },
                    () => {
                      // No lock — proceed with registration or game
                      if (!res.UserName || res.UserName === "Test" || res.UserName === "Test User") {
                        setScreen("register");
                      } else {
                        setUserName(res.UserName);
                        setScreen("game");
                        // Increment gameKey to force fresh iframe on new play
                        setGameKey(k => k + 1);
                      }
                    }
                  );
                } catch (lockErr) {
                  console.error("🔒 [LOCK-POST-OTP] Lock check error:", lockErr);
                  // Fallback: proceed normally
                  if (!res.UserName || res.UserName === "Test") {
                    setScreen("register");
                  } else {
                    setUserName(res.UserName);
                    setScreen("game");
                  }
                }
              } catch (verifyErr: unknown) {
                const msg = verifyErr instanceof Error ? verifyErr.message : "Unknown error";
                console.error("🚀 [OTP] Verify error:", msg);
                alert(`VERIFICATION FAILED: ${msg}`);
              } finally {
                setLoading(false);
              }
            }}
            onSaveUser={async () => {
              setLoading(true);
              try {
                await flippitApi.saveUser(userName, sessionData!.token, isDebug);
                
                const s: UserSession = { 
                  ...sessionData!, 
                  name: userName
                };
                localStorage.setItem(SESSION_KEY, JSON.stringify(s));
                setSessionData(s);
                sessionRef.current = s;

                setScreen("game");
                setGameKey(k => k + 1);
              } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Registration failed";
                console.error("🚀 [Register] Save error:", msg);
                alert(`REGISTRATION FAILED: ${msg}`);
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
                  debug={isDebug}
                  onPuzzleLoad={handlePuzzleLoad}
                  onPuzzleComplete={onPuzzleComplete}
                  onPuzzleExpired={handleExpired}
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
            sharing={sharing}
          />
        )}

        {screen === "expired" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="screen-container">
            <Clock size={64} color="white" style={{ marginBottom: 24 }} />
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>PUZZLE EXPIRED</h2>
              <p style={{ color: "rgba(255,255,255,0.6)" }}>This puzzle is no longer live. Come back tomorrow!</p>
            </div>
            <button className="btn-primary" style={{ marginTop: 32 }} onClick={() => setScreen("splash")}>BACK HOME</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{showHow && <HowToPlay onClose={() => setShowHow(false)} />}</AnimatePresence>
    </div>
  );
}
