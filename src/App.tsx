import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Page components
import Home from './pages/Home';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Create from './pages/Create';
import Dashboard from './pages/Dashboard';
import View from './pages/View';
import About from './pages/About';
import NotFound from './pages/NotFound';

// Admin and Profile components (placeholder for now)
const Admin = () => (
  <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Admin Dashboard</h1>
      <p className="mt-4 text-neutral-600 dark:text-neutral-300">
        Coming soon. This page will provide admin controls for managing users and content.
      </p>
    </div>
  </div>
);

const Profile = () => (
  <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">User Profile</h1>
      <p className="mt-4 text-neutral-600 dark:text-neutral-300">
        Coming soon. This page will allow users to manage their profile settings.
      </p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/success" element={<AuthCallback />} />
          <Route path="/about" element={<About />} />
          <Route path="/view/:id" element={<View />} />
          <Route path="/m/:id" element={<View />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<Create />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          {/* Admin routes */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;