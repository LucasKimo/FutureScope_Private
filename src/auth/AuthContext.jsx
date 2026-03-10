import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginApi, me as meApi, register as registerApi } from '../services/authApi';
import { hydrateLastRoadmapFromServerFresh } from '../services/persist';

const AuthContext = createContext(null);
const TOKEN_KEY = 'fs_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let active = true;

    async function init() {
      if (!token) {
        setLoading(false);
        setUser(null);
        return;
      }

      setLoading(true);
      try {
        const body = await meApi(token);
        if (!active) return;
        setUser(body.user || null);
        await hydrateLastRoadmapFromServerFresh(token);
      } catch {
        if (!active) return;
        localStorage.removeItem(TOKEN_KEY);
        setToken('');
        setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    init();
    return () => {
      active = false;
    };
  }, [token]);

  const api = useMemo(() => {
    return {
      token,
      user,
      loading,
      async login(email, password) {
        const body = await loginApi({ email, password });
        localStorage.setItem(TOKEN_KEY, body.token);
        setToken(body.token);
        setUser(body.user || null);
        await hydrateLastRoadmapFromServerFresh(body.token);
        return body;
      },
      async register(email, password) {
        const body = await registerApi({ email, password });
        localStorage.setItem(TOKEN_KEY, body.token);
        setToken(body.token);
        setUser(body.user || null);
        await hydrateLastRoadmapFromServerFresh(body.token);
        return body;
      },
      logout() {
        localStorage.removeItem(TOKEN_KEY);
        setToken('');
        setUser(null);
      }
    };
  }, [token, user, loading]);

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}

