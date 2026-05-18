import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'tpm_auth';

const getInitialAuth = () => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return { token: null, user: null };

  try {
    const parsed = JSON.parse(stored);
    return { token: parsed.token || null, user: parsed.user || null };
  } catch {
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(getInitialAuth);

  const saveAuth = (value) => {
    setAuth(value);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
  };

  const clearAuth = () => {
    setAuth({ token: null, user: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthenticated: Boolean(auth.token),
      login: saveAuth,
      logout: clearAuth,
    }),
    [auth.token, auth.user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
