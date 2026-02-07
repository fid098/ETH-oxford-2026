const BASE = "/api";

export interface ClaimWithOdds {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "active" | "resolved_yes" | "resolved_no";
  created_at: string;
  resolved_at: string | null;
  created_by?: string | null;
  resolution_type?: "manual" | "oracle";
  resolution_date?: string | null;
  oracle_config?: {
    type: "chainlink_price";
    feed: string;
    comparator: ">" | ">=" | "<" | "<=";
    target: number;
  } | null;
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
  reasoning?: string | null;
}

export interface UserProfile {
  username: string;
  display_name: string;
  wallet_address?: string | null;
  points: number;
  accuracy: number | null;
  total_resolved: number;
  category_stats: Record<string, { correct: number; total: number; accuracy: number }>;
  active_positions: Position[];
  resolved_positions: Position[];
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
  if (res.status === 204) {
    return null as T;
  }
  const text = await res.text();
  if (!text) {
    return null as T;
  }
  return JSON.parse(text) as T;
}

export const api = {
  getClaims: () => request<ClaimWithOdds[]>("/claims/"),
  getClaim: (id: string) => request<ClaimWithOdds>(`/claims/${id}`),
  createClaim: (data: {
    title: string;
    description: string;
    category: string;
    created_by?: string | null;
    resolution_type?: "manual" | "oracle";
    resolution_date?: string | null;
    oracle_config?: {
      type: "chainlink_price";
      feed: string;
      comparator: ">" | ">=" | "<" | "<=";
      target: number;
    } | null;
  }) =>
    request("/claims/", { method: "POST", body: JSON.stringify(data) }),
  deleteClaim: (id: string, username: string) =>
    request(`/claims/${id}?username=${encodeURIComponent(username)}`, { method: "DELETE" }),
  resolveClaim: (id: string, resolution: "yes" | "no") =>
    request(`/claims/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolution }),
    }),
  getOracleStatus: (id: string) =>
    request<{
      feed: string;
      comparator: ">" | ">=" | "<" | "<=";
      target: number;
      current_value: number;
      updated_at: number;
      would_resolve: boolean;
      resolution_date: string | null;
      network: string;
      rpc: string;
    }>(`/claims/${id}/oracle-status`),
  checkOracle: (id: string) =>
    request<{
      resolved: boolean;
      resolution?: "yes" | "no";
      current_value: number;
      would_resolve?: boolean;
      resolution_date?: string;
    }>(`/claims/${id}/check-oracle`, { method: "POST" }),

  getUsers: () => request<UserProfile[]>("/users/"),
  getUser: (username: string) => request<UserProfile>(`/users/${username}`),

  getPositions: () => request<Position[]>("/positions/"),
  createPosition: (data: {
    claim_id: string;
    username: string;
    side: "yes" | "no";
    stake: number;
    confidence: number;
    reasoning?: string | null;
  }) => request<Position>("/positions/", { method: "POST", body: JSON.stringify(data) }),

  getAuthNonce: (address: string) =>
    request<{ nonce: string }>(`/auth/nonce?address=${encodeURIComponent(address)}`),
  connectWallet: (data: { message: string; signature: string }) =>
    request<{ username: string; display_name: string; wallet_address: string }>(
      "/auth/connect-wallet",
      { method: "POST", body: JSON.stringify(data) }
    ),
};
