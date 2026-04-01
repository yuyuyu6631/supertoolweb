"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchCurrentUser, logoutAuth, type AuthUser } from "@/src/app/lib/auth-api";

type AuthStatus = "loading" | "authenticated" | "guest" | "error";

interface AuthContextValue {
  currentUser: AuthUser | null;
  status: AuthStatus;
  message: string | null;
  setCurrentUser: (user: AuthUser | null) => void;
  refreshSession: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [message, setMessage] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const user = await fetchCurrentUser();
      setCurrentUser(user);
      setStatus(user ? "authenticated" : "guest");
      setMessage(null);
      return user;
    } catch {
      setCurrentUser(null);
      setStatus("error");
      setMessage("当前无法读取登录状态，请确认后端服务已经启动。");
      return null;
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const handleSetCurrentUser = useCallback((user: AuthUser | null) => {
    setCurrentUser(user);
    setStatus(user ? "authenticated" : "guest");
    setMessage(null);
  }, []);

  const logout = useCallback(async () => {
    await logoutAuth();
    setCurrentUser(null);
    setStatus("guest");
    setMessage(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      status,
      message,
      setCurrentUser: handleSetCurrentUser,
      refreshSession,
      logout,
    }),
    [currentUser, handleSetCurrentUser, logout, message, refreshSession, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
