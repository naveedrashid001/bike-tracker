import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAuthToken, loadStoredToken } from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = loadStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    // Sirf token pe bharosa nahi karte — backend se /auth/me call kar ke
    // confirm karte hain ke token abhi bhi valid hai aur fresh user data
    // milta hai. Kabhi bhi user object localStorage mein save nahi karte.
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setAuthToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (phone, password) => {
    const res = await api.post('/auth/login', { phone, password });
    setAuthToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await api.post('/auth/register', payload);
    setAuthToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth ko AuthProvider ke andar use karo');
  return ctx;
}
