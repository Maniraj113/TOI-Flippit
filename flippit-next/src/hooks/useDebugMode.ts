"use client";

import { useState, useEffect } from "react";

export function useDebugMode() {
  const [isDebug, setIsDebug] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("debug") === "true";
    }
    return false;
  });

  const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const debugParam = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("debug") === "true") : false;

  return { isDebug, debugParam, isLocal, setIsDebug };
}
