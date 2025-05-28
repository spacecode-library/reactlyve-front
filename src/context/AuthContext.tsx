import { createContext, useContext, useEffect, useState } from 'react';
// axios import is not directly used here anymore for requests, api service is.
import api, { profileApi } from '../services/api'; // Import profileApi
import { User } from '../types/user'; // Import User from types

interface AuthContextType {
  user: User | null; // Use the imported User type
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean; // ✅ Add this line
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // useEffect(() => {
  //   const stored = localStorage.getItem('token');
  //   if (stored) {
  //     setToken(stored);
  //     api.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
  //     api.get('/auth/me')
  //       .then(res => setUser(res.data.user))
  //       .catch(() => {
  //         localStorage.removeItem('token');
  //         setToken(null);
  //       });
  //   }
  // }, []);
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      setError(null);
      
      const stored = localStorage.getItem('token');
      if (stored) {
        try {
          setToken(stored);
          // The Authorization header is already set by the api instance's interceptor
          // in src/services/api.ts if a token is present in localStorage,
          // so explicitly setting api.defaults.headers.common['Authorization'] here might be redundant
          // if the api instance used by profileApi already includes this interceptor.
          // However, to be safe and ensure it's set before the first call if not already,
          // we can keep it, or rely on the interceptor. For now, let's assume the interceptor handles it.
          
          const response = await profileApi.getProfileMe(); // Use profileApi.getProfileMe()
          setUser(response.data); // Assuming response.data is the user object
        } catch (err) {
          console.error('Authentication failed:', err);
          setError('Failed to authenticate');
          localStorage.removeItem('token');
          setToken(null);
          delete api.defaults.headers.common['Authorization'];
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = () => {
    setIsLoading(true);
    const isLocal = window.location.hostname === 'localhost';
    const baseUrl = isLocal
    ? 'http://localhost:8000'
    : 'https://reactlyve-backend.onrender.com'; // 🔁 Update this to match your actual backend Render URL
    window.location.href = `${baseUrl}/api/auth/google`;
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Optional: Call logout API if you have one
      // await api.post('/auth/logout');
      
      setUser(null);
      setToken(null);
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
    value={{ 
      user, 
      token, 
      isLoading,
      error,
      login, 
      logout,
      isAuthenticated: !!user
    }}
  >
    {children}
  </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
