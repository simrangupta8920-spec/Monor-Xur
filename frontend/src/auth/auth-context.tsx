// Auth state for caregiver / health-worker modes. Token stored securely,
// user profile cached in general storage. Patient mode never uses this.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { api, ApiError, type Role, type User } from "@/src/lib/api";
import { storage } from "@/src/utils/storage";

const TOKEN_KEY = "monor_xur_access_token";
const USER_KEY = "monor_xur_user";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, role: Role, name: string) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const savedToken = await storage.secureGet<string | null>(TOKEN_KEY, null);
      const savedUser = await storage.getItem<any>(USER_KEY, null);
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser as User);
      }
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (accessToken: string, u: User) => {
    setToken(accessToken);
    setUser(u);
    await storage.secureSet(TOKEN_KEY, accessToken);
    await storage.setItem(USER_KEY, u as any);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.login(email.trim(), password);
      await persist(res.access_token, res.user);
      return res.user;
    },
    [persist],
  );

  const register = useCallback(
    async (email: string, password: string, role: Role, name: string) => {
      const res = await api.register(email.trim(), password, role, name.trim());
      await persist(res.access_token, res.user);
      return res.user;
    },
    [persist],
  );

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    await storage.secureRemove(TOKEN_KEY);
    await storage.removeItem(USER_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
