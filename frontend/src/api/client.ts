import { storage } from "@/src/utils/storage";

export const TOKEN_KEY = "localloop_session_token";
const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

async function authHeaders(): Promise<Record<string, string>> {
  const token = await storage.secureGet<string>(TOKEN_KEY, "");
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

async function req(path: string, options: RequestInit = {}) {
  const headers = { ...(await authHeaders()), ...(options.headers || {}) };
  const res = await fetch(`${BASE}/api${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export type EventItem = {
  id: string;
  title: string;
  category: string;
  start_time: string;
  description: string;
  image_url: string;
  instagram: string;
  website: string;
  tickets_url: string;
  latitude: number;
  longitude: number;
  address: string;
  checkins: number;
  live_count: number;
  is_hot: boolean;
  created_by: string;
};

export const api = {
  listEvents: (category?: string): Promise<EventItem[]> =>
    req(`/events${category && category !== "all" ? `?category=${category}` : ""}`),
  getEvent: (id: string): Promise<EventItem> => req(`/events/${id}`),
  createEvent: (payload: any): Promise<EventItem> =>
    req(`/events`, { method: "POST", body: JSON.stringify(payload) }),
  checkin: (id: string): Promise<EventItem & { checked_in: boolean }> =>
    req(`/events/${id}/checkin`, { method: "POST" }),
  checkinStatus: (id: string): Promise<{ checked_in: boolean }> =>
    req(`/events/${id}/checkin-status`),
  createAuthSession: (session_id: string) =>
    req(`/auth/session`, { method: "POST", body: JSON.stringify({ session_id }) }),
  devSession: () => req(`/auth/dev-session`, { method: "POST" }),
  me: () => req(`/auth/me`),
  logout: () => req(`/auth/logout`, { method: "POST" }),
};
