import React, { Suspense } from 'react'; // Import React and Suspense
import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/common/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
// import CookieBanner from './components/common/CookieBanner';
import LoadingSpinner from './components/common/LoadingSpinner'; // Import LoadingSpinner

// Page components using React.lazy
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'));
const Create = React.lazy(() => import('./pages/Create'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const View = React.lazy(() => import('./pages/View'));
const About = React.lazy(() => import('./pages/About'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const Message = React.lazy(() => import('./pages/Message'));
const Reaction = React.lazy(() => import('./pages/Reaction'));
const ProfilePage = React.lazy(() => import('./pages/Profile'));
const AdminPortalPage = React.lazy(() => import('./pages/AdminPortal'));
const TermsPage = React.lazy(() => import('./pages/Terms'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/Privacy'));
const CookiePolicyPage = React.lazy(() => import('./pages/CookiePolicy'));

function App() {
  return (
      <AuthProvider>
        <ScrollToTop />
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><LoadingSpinner size="lg" /></div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/success" element={<AuthCallback />} />
            <Route path="/about" element={<About />} />
            <Route path="/view/:id" element={<View />} />
            <Route path="/m/:id" element={<View />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create" element={<Create />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/message/:id" element={<Message/>} />
              <Route path="/reaction/:reactionId" element={<Reaction />} />
            </Route>
            
            {/* Admin routes */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route path="/admin" element={<AdminPortalPage />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        
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
        {/* <CookieBanner /> */} {/* Cookie management bar disabled */}
      </AuthProvider>
  );
}

export default App;
