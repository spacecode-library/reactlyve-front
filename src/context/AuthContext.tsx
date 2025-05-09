import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;

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
          api.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
          const response = await api.get('/auth/me');
          setUser(response.data.user);
          console.log('User authenticated successfully:', response.data.user);
        } catch (err) {
          console.error('Authentication failed:', err);
          setError('Failed to authenticate');
          localStorage.removeItem('token');
          setToken(null);
          delete api.defaults.headers.common['Authorization'];
        }
      } else {
        console.log('No token found in localStorage');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = () => {
    setIsLoading(true);
    // Redirect to Google OAuth
    window.location.href = 'http://localhost:8000/api/auth/google';
  };
  console.log("user",user)
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
      logout 
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