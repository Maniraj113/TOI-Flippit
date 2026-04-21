const BASE_URL = "https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com";
const OFFLINE_QUEUE_KEY = "flippit_offline_queue";

export interface UserSession {
  id: string; // hash_id
  token: string;
  name?: string;
}

export interface GameLog {
  g_id: string;
  status: string;
  score: number;
  time_taken: number;
  created_at: string;
  updated_at: string;
}

// ─── Offline Queue: Retry failed saveGame calls when network returns ───
interface QueuedGame {
  data: Record<string, unknown>;
  token: string;
  timestamp: number;
}

function getOfflineQueue(): QueuedGame[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addToOfflineQueue(data: Record<string, unknown>, token: string) {
  try {
    const queue = getOfflineQueue();
    queue.push({ data, token, timestamp: Date.now() });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    console.warn("[OfflineQueue] Game result queued for retry.", data);
  } catch {
    console.error("[OfflineQueue] Failed to persist to localStorage.");
  }
}

async function flushOfflineQueue() {
  try {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;
    console.log(`[OfflineQueue] Flushing ${queue.length} queued results...`);
    const remaining: QueuedGame[] = [];
    for (const item of queue) {
      try {
        const res = await fetch(`${BASE_URL}/save-game`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${item.token}`,
          },
          body: JSON.stringify(item.data),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        console.log("[OfflineQueue] Successfully synced queued result.");
      } catch {
        // Keep failed items for the next attempt
        remaining.push(item);
      }
    }
    if (remaining.length > 0) {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    } else {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
    }
  } catch {
    // silently ignore flush errors
  }
}

export const flippitApi = {
  sendOtp: async (phone: string, debug: boolean = false) => {
    if (debug) return { success: true, mock: true };
    const res = await fetch(`${BASE_URL}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    return res.json();
  },

  verifyOtp: async (phone: string, otp: string, debug: boolean = false) => {
    if (debug) {
      return {
        FirstTimeUser: false,
        UserId: "debug-user",
        UserName: "Debug Player",
        token: "mock-token",
      };
    }
    const res = await fetch(`${BASE_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });
    return res.json();
  },

  saveUser: async (name: string, token: string, debug: boolean = false) => {
    if (debug) return { success: true };
    const res = await fetch(`${BASE_URL}/save-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ user_name: name }),
    });
    return res.json();
  },

  saveGame: async (data: Record<string, unknown>, token: string, debug: boolean = false) => {
    if (debug) return { success: true };

    // Try to flush any previously queued offline results first
    await flushOfflineQueue();

    try {
      const res = await fetch(`${BASE_URL}/save-game`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    } catch (err) {
      // Network failure or server error — queue for retry
      console.error("[saveGame] Failed. Queuing for offline retry.", err);
      addToOfflineQueue(data, token);
      return { queued: true };
    }
  },

  getUserStats: async (userId: string, debug: boolean = false, token?: string) => {
    // FIX: Debug mode always allows play.
    if (debug) {
      return { gameLogs: [] };
    }
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}/user/${userId}`, { headers });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("HTTP 401 Unauthorized");
      }
      if (res.status === 404) {
        // Safe 404: user doesn't exist yet, so no logs.
        return { gameLogs: [] };
      }
      throw new Error(`HTTP ${res.status}`);
    }

    return res.json();
  },
};
