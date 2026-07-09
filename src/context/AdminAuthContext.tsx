import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  AdminUser,
  clearAdminToken,
  getAdminToken,
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
} from "@/lib/api";

interface AdminAuthContextValue {
  admin: AdminUser | null;
  token: string;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => getAdminToken());

  const refresh = async () => {
    const currentToken = getAdminToken();
    if (!currentToken) {
      setAdmin(null);
      setToken("");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const current = await getCurrentAdmin();
      setAdmin(current);
      setToken(currentToken);
    } catch {
      clearAdminToken();
      setAdmin(null);
      setToken("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const login = async (username: string, password: string) => {
    const result = await loginAdmin(username, password);
    setAdmin(result.admin);
    setToken(result.token);
    setLoading(false);
  };

  const logout = async () => {
    try {
      await logoutAdmin();
    } finally {
      setAdmin(null);
      setToken("");
      setLoading(false);
    }
  };

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      admin,
      token,
      loading,
      login,
      logout,
      refresh,
    }),
    [admin, token, loading]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}

