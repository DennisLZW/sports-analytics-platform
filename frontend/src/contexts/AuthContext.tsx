import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getStoredToken } from '../api/client';
import * as authApi from '../api/auth';
import type { User } from '../api/auth';

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getAuthErrorMessage(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object' || !('response' in err)) return fallback;
  const data = (err as { response?: { data?: { error?: string } } }).response?.data;
  const code = data?.error;
  if (code === 'INTERNAL_ERROR') return 'Server error, please try again.';
  if (code === 'EMAIL_IN_USE') return 'This email is already registered.';
  if (code === 'INVALID_CREDENTIALS') return 'Invalid email or password.';
  if (code === 'EMAIL_AND_PASSWORD_REQUIRED') return 'Email and password are required.';
  if (code === 'WRONG_PASSWORD') return 'Current password is incorrect.';
  if (code === 'PASSWORD_TOO_SHORT') return 'New password must be at least 6 characters.';
  if (code === 'CURRENT_AND_NEW_PASSWORD_REQUIRED') return 'Current and new password are required.';
  if (code === 'NAME_REQUIRED') return 'Display name is required.';
  return (typeof code === 'string' ? code : fallback) || fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.fetchMe();
      setUser(me ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        const { user: u } = await authApi.login(email, password);
        setUser(u);
      } catch (err: unknown) {
        const msg = getAuthErrorMessage(err, 'Login failed');
        setError(msg);
        throw err;
      }
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      setError(null);
      try {
        const { user: u } = await authApi.register(email, password, name);
        setUser(u);
      } catch (err: unknown) {
        const msg = getAuthErrorMessage(err, 'Register failed');
        setError(msg);
        throw err;
      }
    },
    []
  );

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const updateUser = useCallback((u: User | null) => setUser(u), []);
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      login,
      register,
      logout,
      clearError,
      updateUser,
    }),
    [user, loading, error, login, register, logout, clearError, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
