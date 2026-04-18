const BASE_URL = "https://zr84sznqb5.execute-api.ap-south-1.amazonaws.com";

export interface UserSession {
  id: string;
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

export const flippitApi = {
  sendOtp: async (phone: string, debug: boolean = false) => {
    if (debug) return { success: true, mock: true };
    const res = await fetch(`/api/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    return res.json();
  },

  verifyOtp: async (phone: string, otp: string, debug: boolean = false) => {
    if (debug) {
      return {
        FirstTimeUser: true,
        UserId: "debug-" + Math.floor(Math.random() * 1000),
        token: "mock-token"
      };
    }
    const res = await fetch(`/api/otp/verify`, {
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
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ user_name: name }),
    });
    return res.json();
  },

  saveGame: async (data: Record<string, unknown>, token: string, debug: boolean = false) => {
    if (debug) return { success: true };
    const res = await fetch(`${BASE_URL}/save-game`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getUserStats: async (userId: string, debug: boolean = false) => {
    if (debug) {
      return {
        gameLogs: [
          { status: "completed", score: 45, time_taken: 12, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ]
      };
    }
    const res = await fetch(`${BASE_URL}/user/${userId}`);
    return res.json();
  }
};
