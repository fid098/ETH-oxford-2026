const BASE = "/api";

export interface ClaimWithOdds {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "active" | "resolved_yes" | "resolved_no";
  created_at: string;
  resolved_at: string | null;
  yes_percentage: number;
  no_percentage: number;
  total_staked: number;
  position_count: number;
}

export interface Position {
  id: string;
  claim_id: string;
  username: string;
  side: "yes" | "no";
  stake: number;
  confidence: number;
  created_at: string;
}

export interface UserProfile {
  username: string;
  display_name: string;
  points: number;
  accuracy: number | null;
  total_resolved: number;
  category_stats: Record<string, { correct: number; total: number; accuracy: number }>;
  active_positions: Position[];
  resolved_positions: Position[];
}

export interface AnalyticsData {
  tvl: number;
  sentiment: number;
  history: Array<{
    date: string;
    value: number;
    count: number;
  }>;
}

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  getClaims: () => request<ClaimWithOdds[]>("/claims/"),
  getClaim: (id: string) => request<ClaimWithOdds>(`/claims/${id}`),
  createClaim: (data: { title: string; description: string; category: string }) =>
    request("/claims/", { method: "POST", body: JSON.stringify(data) }),
  resolveClaim: (id: string, resolution: "yes" | "no") =>
    request(`/claims/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolution }),
    }),

  getUsers: () => request<UserProfile[]>("/users/"),
  getUser: (username: string) => request<UserProfile>(`/users/${username}`),

  getPositions: () => request<Position[]>("/positions/"),
  createPosition: (data: {
    claim_id: string;
    username: string;
    side: "yes" | "no";
    stake: number;
    confidence: number;
  }) => request<Position>("/positions/", { method: "POST", body: JSON.stringify(data) }),
  getAnalytics: () => request<AnalyticsData>("/analytics"),
};
