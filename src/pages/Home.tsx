import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';

const Home = () => {
  const { user, logout, isLoading } = useAuth();

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative bg-white dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Capture</span>
              <span className="block text-primary-600 dark:text-primary-500">
                Genuine Reactions
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-xl text-neutral-500 dark:text-neutral-300 sm:max-w-3xl">
              Send surprise messages and record your recipients' authentic reactions as they view them.
              Create moments that last forever.
            </p>
            <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
              {isLoading ? (
                // Placeholder for buttons during loading to prevent layout shift.
                // This creates a space roughly equivalent to two buttons.
                <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0" style={{ minHeight: '46px' }}> 
                  {/* You can make this more sophisticated with actual skeleton elements if desired */}
                  <div className="flex items-center justify-center rounded-md border border-transparent bg-neutral-200 dark:bg-neutral-700 px-4 py-3 text-base font-medium text-transparent shadow-sm sm:px-8" style={{ minWidth: '120px' }}>&nbsp;</div>
                  <div className="flex items-center justify-center rounded-md border border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-700 px-4 py-3 text-base font-medium text-transparent shadow-sm sm:px-8" style={{ minWidth: '120px' }}>&nbsp;</div>
                </div>
              ) : user ? (
                <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                  <Link
                    to="/create"
                    className="flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 sm:px-8"
                  >
                    Create Message
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-3 text-base font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 sm:px-8"
                  >
                    My Dashboard
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                  <Link
                    to="/login"
                    className="flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 sm:px-8"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/about"
                    className="flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-3 text-base font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 sm:px-8"
                  >
                    Learn More
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="bg-neutral-100 dark:bg-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xl text-neutral-500 dark:text-neutral-300 sm:mt-4">
              Three simple steps to capture authentic reactions.
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="mt-6 text-xl font-medium text-neutral-900 dark:text-white">
                  Create Your Message
                </h3>
                <p className="mt-2 text-center text-base text-neutral-500 dark:text-neutral-300">
                  Write a personal message, add an image, and set an optional passcode.
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="mt-6 text-xl font-medium text-neutral-900 dark:text-white">
                  Share the Link
                </h3>
                <p className="mt-2 text-center text-base text-neutral-500 dark:text-neutral-300">
                  Email or message the generated link to your recipients.
                </p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="mt-6 text-xl font-medium text-neutral-900 dark:text-white">
                  Watch Their Reaction
                </h3>
                <p className="mt-2 text-center text-base text-neutral-500 dark:text-neutral-300">
                  Their webcam records their reaction and sends it back to you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-white dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Key Features
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xl text-neutral-500 dark:text-neutral-300 sm:mt-4">
              Everything you need to create memorable moments.
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-neutral-50 p-6 shadow-md dark:bg-neutral-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
                Real-Time Recording
              </h3>
              <p className="mt-2 text-neutral-500 dark:text-neutral-300">
                Capture authentic reactions as recipients open your messages for the first time.
              </p>
            </div>
            
            <div className="rounded-lg bg-neutral-50 p-6 shadow-md dark:bg-neutral-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
                Passcode Protection
              </h3>
              <p className="mt-2 text-neutral-500 dark:text-neutral-300">
                Add an extra layer of security by requiring a passcode to view your messages.
              </p>
            </div>
            
            <div className="rounded-lg bg-neutral-50 p-6 shadow-md dark:bg-neutral-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
                Image Support
              </h3>
              <p className="mt-2 text-neutral-500 dark:text-neutral-300">
                Enhance your messages with photos to make them more personal and impactful.
              </p>
            </div>
            
            <div className="rounded-lg bg-neutral-50 p-6 shadow-md dark:bg-neutral-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
                Dashboard Analytics
              </h3>
              <p className="mt-2 text-neutral-500 dark:text-neutral-300">
                Track message views, reaction rates, and manage all your content in one place.
              </p>
            </div>
            
            <div className="rounded-lg bg-neutral-50 p-6 shadow-md dark:bg-neutral-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
                Easy Sharing
              </h3>
              <p className="mt-2 text-neutral-500 dark:text-neutral-300">
                Share your message links via email, messaging apps, or even QR codes.
              </p>
            </div>
            
            <div className="rounded-lg bg-neutral-50 p-6 shadow-md dark:bg-neutral-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
                Video Downloads
              </h3>
              <p className="mt-2 text-neutral-500 dark:text-neutral-300">
                Download reaction videos to keep or share them on your favorite platforms.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-primary-600 dark:bg-primary-700">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16 lg:px-8">
          <div className="rounded-lg bg-primary-700 px-6 py-6 md:py-12 md:px-12 lg:flex lg:items-center lg:justify-between dark:bg-primary-800">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block text-primary-200">Create your first message today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  to={user ? "/create" : "/login"}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-primary-600 hover:bg-primary-50"
                >
                  {user ? "Create Message" : "Get Started"}
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-500 px-5 py-3 text-base font-medium text-white hover:bg-primary-400"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;