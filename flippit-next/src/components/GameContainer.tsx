"use client";

import { useEffect, useRef, useState, useMemo } from "react";

interface PuzzleCompleteData {
  id: string;
  score: number;
  timeTaken: number;
  [key: string]: any;
}

interface GameContainerProps {
  uid: string;
  gameId: string;
  onPuzzleLoad: (id: string) => void;
  onPuzzleComplete: (data: PuzzleCompleteData) => void;
  onPuzzleExpired: (id: string) => void;
  debug?: boolean;
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
  const [isVisible, setIsVisible] = useState(true);
  const [initTime] = useState(() => Date.now());
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: verify origin if possible, but amuse labs uses multiple subdomains
      // if (event.origin !== "https://puzzleme.amuselabs.com") return;

      let data = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      if (!data || typeof data !== "object") return;

      if (data.type === "PUZZLE_LOAD") {
        console.log("GameContainer: PUZZLE_LOAD", data.id);
        onPuzzleLoad(data.id);
        
        // Safety expiry timer (60s + buffer)
        if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = setTimeout(() => {
          onPuzzleExpired(data.id);
        }, 65000); 
      }

      // Support various AmuseLabs and standard completion patterns
      const isComplete = data.type === "PUZZLE_COMPLETE" || 
                         data.type === "PUZZLE_SOLVED" || 
                         data.msg === "solved" ||
                         data.event === "puzzle-solved";

      if (isComplete) {
        console.log("GameContainer: SUCCESS detected", data);
        if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
        onPuzzleComplete({
          id: data.id || gameId,
          score: data.score || 0,
          timeTaken: data.timeTaken || 0
        });
        setIsVisible(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    };
  }, [onPuzzleLoad, onPuzzleComplete, onPuzzleExpired]);

  // Construct URL with bypass for testing if debug is true
  const finalUid = useMemo(() => {
    return debug ? `${uid}-${initTime}` : uid;
  }, [uid, debug, initTime]);

  const url = `https://cdn-in.amuselabs.com/nexus/date-picker?idx=1&set=nexus-toi-synant-puzzles&uid=${finalUid}&embed=1`;

  if (!isVisible) return null;

  return (
    <div className="game-iframe-container relative w-full h-full bg-white overflow-hidden">
      <iframe
        ref={iframeRef}
        src={url}
        width="100%"
        height="100%"
        className="w-full h-full border-none"
        style={{ overflow: "hidden", display: "block" }}
        scrolling="no"
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
        allowFullScreen
      />
      
      {/* Optional: Overlay to prevent interaction before load */}
      {/* <div className="absolute inset-0 pointer-events-none bg-black/5" /> */}
    </div>
  );
}
