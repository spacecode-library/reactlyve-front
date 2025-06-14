import { createContext, useContext, useEffect, useState } from 'react';
// axios import is not directly used here anymore for requests, api service is.
import api, { profileApi } from '../services/api'; // Import profileApi
import { User } from '../types/user'; // Import User from types
import { API_BASE_URL } from '../components/constants/apiRoutes';
import { getToken, setToken as storeToken, removeToken } from '../utils/tokenStorage';

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
  //   const stored = getToken();
  //   if (stored) {
  //     setToken(stored);
  //     api.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
  //     api.get('/auth/me')
  //       .then(res => setUser(res.data.user))
  //       .catch(() => {
  //         removeToken();
  //         setToken(null);
  //       });
  //   }
  // }, []);
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      setError(null);

      const stored = getToken();
      if (stored) {
        try {
          setToken(stored);
          // The Authorization header is already set by the api instance's interceptor
          // in src/services/api.ts if a token cookie is present,
          // so explicitly setting api.defaults.headers.common['Authorization'] here might be redundant
          // if the api instance used by profileApi already includes this interceptor.
          // However, to be safe and ensure it's set before the first call if not already,
          // we can keep it, or rely on the interceptor. For now, let's assume the interceptor handles it.

          const response = await profileApi.getProfileMe(); // Use profileApi.getProfileMe()
          setUser(response.data); // Assuming response.data is the user object
        } catch (err) {
          console.error('Authentication failed:', err);
          setError('Failed to authenticate');
          removeToken();
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
    const loginUrl = `${API_BASE_URL}/auth/google`;
    try {
      const { hostname } = new URL(loginUrl);
      const allowedHosts = ['localhost', 'api.reactlyve.com'];
      if (!allowedHosts.includes(hostname)) {
        throw new Error('Untrusted redirect host');
      }
      window.location.href = loginUrl;
    } catch (err) {
      console.error('Invalid login redirect:', err);
      setError('Unable to start login process.');
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Optional: Call logout API if you have one
      // await api.post('/auth/logout');

      setUser(null);
      setToken(null);
      delete api.defaults.headers.common['Authorization'];
      removeToken();
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
        isAuthenticated: !!user,
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
