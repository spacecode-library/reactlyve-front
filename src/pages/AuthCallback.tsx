import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // After Google OAuth redirect, the backend should have set the cookie
        // We just need to fetch the user data
        const response = await axios.get('/api/auth/user', { withCredentials: true });
        
        if (response.data.user) {
          // Successfully authenticated, redirect to dashboard
          navigate('/dashboard');
        } else {
          // Something went wrong
          setError('Failed to get user data. Please try again.');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Authentication failed. Please try again.');
      }
    };

    fetchUserData();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-neutral-800">
        {error ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
              Authentication Error
            </h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-300">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 rounded-md bg-primary-500 px-4 py-2 text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex justify-center">
              <svg
                className="h-12 w-12 animate-spin text-primary-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-neutral-900 dark:text-white">
              Finalizing Authentication
            </h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-300">
              Please wait while we complete the sign-in process...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;