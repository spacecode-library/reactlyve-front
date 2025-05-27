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
import Message from './pages/Message';
import Reaction from './pages/Reaction';
import ProfilePage from './pages/Profile'; // Import the actual ProfilePage
import AdminPortalPage from './pages/AdminPortal'; // Import AdminPortalPage

// Placeholder Admin component removed

// Placeholder for Profile has been removed, ProfilePage is imported instead.

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
            <Route path="/profile" element={<ProfilePage />} /> {/* Use ProfilePage here */}
            <Route path="/message/:id" element={<Message/>} />
            <Route path="/reaction/:reactionId" element={<Reaction />} />
          </Route>
          
          {/* Admin routes */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/admin" element={<AdminPortalPage />} /> {/* Use AdminPortalPage here */}
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
