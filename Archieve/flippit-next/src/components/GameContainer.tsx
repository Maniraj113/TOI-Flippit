"use client";

import { useEffect, useRef, useMemo, useState } from "react";

interface PuzzleCompleteData {
  id: string;
  score: number;
  timeTaken: number;
}

interface GameContainerProps {
  uid: string;
  gameId: string;
  onPuzzleLoad: (id: string) => void;
  onPuzzleComplete: (data: PuzzleCompleteData) => void;
  onPuzzleExpired: (id: string) => void;
  debug?: boolean;
}

// useGameBridge — centralizes all iframe postMessage communication.
// Extracted as a named hook for clarity and testability.
function useGameBridge(
  gameId: string,
  onPuzzleLoad: (id: string) => void,
  onPuzzleComplete: (data: PuzzleCompleteData) => void,
  onPuzzleExpired: (id: string) => void
) {
  const onLoadRef = useRef(onPuzzleLoad);
  const onCompleteRef = useRef(onPuzzleComplete);
  const onExpiredRef = useRef(onPuzzleExpired);
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDoneRef = useRef(false);

  useEffect(() => { onLoadRef.current = onPuzzleLoad; }, [onPuzzleLoad]);
  useEffect(() => { onCompleteRef.current = onPuzzleComplete; }, [onPuzzleComplete]);
  useEffect(() => { onExpiredRef.current = onPuzzleExpired; }, [onPuzzleExpired]);

  useEffect(() => {
    isDoneRef.current = false;
    const handleMessage = (event: MessageEvent) => {
      // 1. Broadly identify data (handle JSON strings vs already-parsed objects)
      let data: any = {};
      if (typeof event.data === "string") {
        try { 
          data = JSON.parse(event.data); 
        } catch { 
          data = { raw: event.data }; 
        }
      } else if (event.data && typeof event.data === "object") {
        data = event.data;
      } else {
        return;
      }

      // Helper to match solve-related keywords
      const isMatch = (val: any) => {
        const s = String(val || "").toLowerCase();
        return s.includes("solved") || s.includes("complete") || s.includes("success") || s.includes("finish");
      };

      // 2. Identify PUZZLE_LOAD to start the timer
      const typeStr = String(data.type || "").toUpperCase();
      const eventStr = String(data.event || "").toUpperCase();
      if (typeStr.includes("LOAD") || eventStr.includes("LOAD")) {
        const puzzleId = String(data.id || gameId);
        onLoadRef.current(puzzleId);
        
        if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = setTimeout(() => {
          if (isDoneRef.current) return;
          isDoneRef.current = true;
          onExpiredRef.current(puzzleId);
        }, 65000);
        return;
      }

      // 3. Identify Completion (BROAD MATCH)
      const isComplete = 
        isMatch(data.type) || 
        isMatch(data.event) || 
        isMatch(data.msg) || 
        isMatch(data.status) ||
        (data.data && isMatch(data.data.event)) || // Nested structures
        (typeof event.data === "string" && isMatch(event.data)); // Raw match

      if (isComplete) {
        if (isDoneRef.current) return;
        isDoneRef.current = true;
        
        if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);

        // Extract metrics if available, otherwise onPuzzleComplete calculates speed
        onCompleteRef.current({
          id: String(data.id || data.puzzleId || gameId),
          score: Number(data.score || 0),
          timeTaken: Number(data.timeTaken || data.duration || 0),
        });
      }

      // 4. Handle Expiry
      if (String(data.type || "").includes("EXPIRE") || String(data.msg || "").includes("expire")) {
        if (isDoneRef.current) return;
        isDoneRef.current = true;
        if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
        onExpiredRef.current(String(data.id || gameId));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    };
  }, [gameId]);
}

export default function GameContainer({
  uid,
  gameId,
  onPuzzleLoad,
  onPuzzleComplete,
  onPuzzleExpired,
  debug = false
}: GameContainerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // useState lazy initializer is pure — runs once on mount, never on re-render
  const [initTime] = useState<number>(() => Date.now());

  useGameBridge(gameId, onPuzzleLoad, onPuzzleComplete, onPuzzleExpired);

  // In debug mode, append a timestamp to the UID to bypass AmuseLabs' "already played" cache
  const finalUid = useMemo(() => {
    return debug ? `${uid}-${initTime}` : uid;
  }, [uid, debug, initTime]);

  const url = `https://cdn-in.amuselabs.com/nexus/date-picker?idx=1&set=nexus-toi-synant-puzzles&uid=${finalUid}&embed=1`;

  return (
    <div className="w-full h-full bg-white overflow-hidden" style={{ position: "relative" }}>
      <iframe
        ref={iframeRef}
        src={url}
        width="100%"
        height="100%"
        style={{ border: "none", display: "block", overflow: "hidden" }}
        scrolling="no"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
        allowFullScreen
        title="Flippit Game"
      />
    </div>
  );
}
