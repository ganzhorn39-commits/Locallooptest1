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
  reservation_url?: string;
  capacity?: number;
  spots_taken?: number;
  rating?: number;
  rating_count?: number;
  latitude: number;
  longitude: number;
  address: string;
  checkins: number;
  live_count: number;
  is_hot: boolean;
  created_by: string;
  emoji?: string;
  banner_url?: string;
  venue_name?: string;
  verified?: boolean;
  is_recurring?: boolean;
  recurrence_label?: string;
  next_occurrence?: string;
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
  participants: (id: string): Promise<{ count: number; participants: any[] }> =>
    req(`/events/${id}/participants`),

  // Saves
  toggleSave: (id: string): Promise<{ saved: boolean }> => req(`/events/${id}/save`, { method: "POST" }),
  saveStatus: (id: string): Promise<{ saved: boolean }> => req(`/events/${id}/save-status`),
  mySaved: (): Promise<EventItem[]> => req(`/my/saved`),
  myAttending: (): Promise<EventItem[]> => req(`/my/attending`),

  // Push
  registerPush: (payload: { user_id: string; platform: string; device_token: string }) =>
    req(`/register-push`, { method: "POST", body: JSON.stringify(payload) }),

  // Profile
  updateProfile: (payload: any) => req(`/profile`, { method: "PATCH", body: JSON.stringify(payload) }),

  // Reviews / ratings
  getReviews: (id: string): Promise<any[]> => req(`/events/${id}/reviews`),
  postReview: (id: string, rating: number, comment: string) =>
    req(`/events/${id}/reviews`, { method: "POST", body: JSON.stringify({ rating, comment }) }),

  // Chat
  getMessages: (id: string): Promise<any[]> => req(`/events/${id}/messages`),
  sendMessage: (id: string, text: string) =>
    req(`/events/${id}/messages`, { method: "POST", body: JSON.stringify({ text }) }),

  // Stories
  getStories: (id: string): Promise<any[]> => req(`/events/${id}/stories`),
  addStory: (id: string, image: string) =>
    req(`/events/${id}/stories`, { method: "POST", body: JSON.stringify({ image }) }),

  // Crews
  createCrew: (name: string) => req(`/crews`, { method: "POST", body: JSON.stringify({ name }) }),
  myCrews: (): Promise<any[]> => req(`/crews`),
  getCrew: (id: string): Promise<any> => req(`/crews/${id}`),
  joinCrew: (invite_code: string) => req(`/crews/join`, { method: "POST", body: JSON.stringify({ invite_code }) }),
  addSuggestion: (crewId: string, payload: { event_id?: string; custom_text?: string }) =>
    req(`/crews/${crewId}/suggestions`, { method: "POST", body: JSON.stringify(payload) }),
  voteSuggestion: (crewId: string, sugId: string) =>
    req(`/crews/${crewId}/suggestions/${sugId}/vote`, { method: "POST" }),

  createAuthSession: (session_id: string) =>
    req(`/auth/session`, { method: "POST", body: JSON.stringify({ session_id }) }),
  devSession: () => req(`/auth/dev-session`, { method: "POST" }),
  me: () => req(`/auth/me`),
  logout: () => req(`/auth/logout`, { method: "POST" }),
};
