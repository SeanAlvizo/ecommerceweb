import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'customer';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: ProfileData) => Promise<void>;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  current_password?: string;
  new_password?: string;
  new_password_confirmation?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('algura_token'));
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const authHeaders = (t?: string) => ({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${t || token}`,
  });

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() });
      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        setUser(data.data);
      } else {
        // Token invalid
        localStorage.removeItem('algura_token');
        setToken(null);
        setUser(null);
      }
    } catch {
      // API not available
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

    if (!res.ok) {
      let errorMsg = data.errors?.email?.[0] || data.message || 'Login failed';
      if (errorMsg === 'The given data was invalid.') {
         errorMsg = 'Incorrect email or password. (Check for trailing spaces)';
      }
      throw new Error(errorMsg);
    }

    localStorage.setItem('algura_token', data.data?.token || '');
    setToken(data.data?.token || null);
    setUser(data.data?.user || null);
  };

  const register = async (regData: RegisterData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(regData),
    });

    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

    if (!res.ok) {
      const firstError = data.errors ? Object.values(data.errors)[0] : null;
      throw new Error(
        data.message ||
        (Array.isArray(firstError) ? firstError[0] : firstError) ||
        'Registration failed'
      );
    }

    localStorage.setItem('algura_token', data.data?.token || '');
    setToken(data.data?.token || null);
    setUser(data.data?.user || null);
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: authHeaders(),
      });
    } catch {
      // Ignore errors
    }
    localStorage.removeItem('algura_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData: ProfileData) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(profileData),
    });

    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

    if (!res.ok) {
      throw new Error(data.message || 'Profile update failed');
    }

    if (data.data) {
      setUser(data.data);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAdmin: user?.role === 'admin',
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
