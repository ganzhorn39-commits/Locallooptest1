import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { storage } from "@/src/utils/storage";
import { api, TOKEN_KEY } from "@/src/api/client";

type User = { user_id: string; email: string; name?: string; picture?: string };
type AuthState = { user: User | null; loading: boolean; loggingIn: boolean };

type Ctx = AuthState & {
  login: () => Promise<void>;
  devLogin: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>({} as Ctx);
const AUTH_BASE = "https://auth.emergentagent.com";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);

  const processSessionId = useCallback(async (sessionId: string) => {
    const res = await api.createAuthSession(sessionId);
    await storage.secureSet(TOKEN_KEY, res.session_token);
    setUser(res.user);
  }, []);

  const bootstrap = useCallback(async () => {
    try {
      // Web: session_id may be present in hash / query on return
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const hash = window.location.hash || "";
        const search = window.location.search || "";
        const m = hash.match(/session_id=([^&]+)/) || search.match(/session_id=([^&]+)/);
        if (m) {
          await processSessionId(decodeURIComponent(m[1]));
          window.history.replaceState(null, "", window.location.pathname);
          setLoading(false);
          return;
        }
      }
      // Existing token
      const token = await storage.secureGet<string>(TOKEN_KEY, "");
      if (token) {
        try {
          const me = await api.me();
          setUser(me);
        } catch {
          await storage.secureRemove(TOKEN_KEY);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [processSessionId]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async () => {
    setLoggingIn(true);
    try {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const redirectUrl = window.location.origin + "/";
        window.location.href = `${AUTH_BASE}/?redirect=${encodeURIComponent(redirectUrl)}`;
        return;
      }
      const redirectUrl = Linking.createURL("");
      const authUrl = `${AUTH_BASE}/?redirect=${encodeURIComponent(redirectUrl)}`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      if (result.type === "success" && result.url) {
        const m =
          result.url.match(/session_id=([^&]+)/) ||
          result.url.match(/#session_id=([^&]+)/);
        if (m) {
          await processSessionId(decodeURIComponent(m[1]));
        }
      }
    } finally {
      setLoggingIn(false);
    }
  }, [processSessionId]);

  const devLogin = useCallback(async () => {
    setLoggingIn(true);
    try {
      const res = await api.devSession();
      await storage.secureSet(TOKEN_KEY, res.session_token);
      setUser(res.user);
    } finally {
      setLoggingIn(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const me = await api.me();
      setUser(me);
    } catch {}
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {}
    await storage.secureRemove(TOKEN_KEY);
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, loading, loggingIn, login, devLogin, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
