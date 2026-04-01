// src/context/AuthContext.jsx
// Global authentication state — wrap your App with this provider

import { createContext, useState, useEffect, useCallback } from 'react';
import { loginUser, logoutUser, getProfile, registerUser } from '../api/authAPI';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);  // checking token on mount
  const [error,   setError]   = useState(null);

  // ── On mount: restore session from localStorage ──────────
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      getProfile()
        .then(({ data }) => setUser(data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Register ─────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    setError(null);
    try {
      const { data } = await registerUser(formData);
      localStorage.setItem('access_token',  data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data || { error: 'Registration failed.' };
      setError(msg);
      return { success: false, errors: msg };
    }
  }, []);

  // ── Login ────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const { data } = await loginUser({ email, password });
      localStorage.setItem('access_token',  data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // Fetch full profile
      const profile = await getProfile();
      setUser(profile.data);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password.';
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  // ── Logout ───────────────────────────────────────────────
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) await logoutUser(refreshToken);
    } catch (_) {
      // Server-side blacklist failed — still clear client
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  }, []);

  // ── Update local user state after profile edit ───────────
  const updateUser = useCallback((updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
