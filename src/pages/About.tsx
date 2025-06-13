import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';

const About: React.FC = () => {
  const { user } = useAuth();
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary-600 dark:text-primary-400 sm:text-5xl">
            About Reactlyve
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-neutral-600 dark:text-neutral-300">
            Capture authentic reactions to your surprise messages
          </p>
        </div>
        
        <div className="mt-16 space-y-16">
          {/* About Section */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              What is Reactlyve?
            </h2>
            <div className="mt-6 text-lg text-neutral-600 dark:text-neutral-300">
              <p>
                Reactlyve is a platform that lets you send surprise messages to friends, family, or colleagues
                and capture their authentic reactions on video when they view your message.
              </p>
              <p className="mt-4">
                Whether you're sharing exciting news, a heartfelt message, or just want to make someone smile,
                Reactlyve helps you preserve those genuine first reactions that would otherwise be lost.
              </p>
            </div>
          </section>
          
          {/* How It Works Section */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              How It Works
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="mt-6 text-xl font-medium text-neutral-900 dark:text-white">
                  Create a Message
                </h3>
                <p className="mt-2 text-base text-neutral-600 dark:text-neutral-300">
                  Craft your surprise message, add an optional image, and set a passcode if you want extra security.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="mt-6 text-xl font-medium text-neutral-900 dark:text-white">
                  Share the Link
                </h3>
                <p className="mt-2 text-base text-neutral-600 dark:text-neutral-300">
                  Send your recipient the unique link (and passcode if you created one) through any messaging platform.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="mt-6 text-xl font-medium text-neutral-900 dark:text-white">
                  Capture Reactions
                </h3>
                <p className="mt-2 text-base text-neutral-600 dark:text-neutral-300">
                  When they open your message, their webcam records their reaction and sends it back to you automatically.
                </p>
              </div>
            </div>
          </section>
          
          {/* Features Section */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Features
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
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
                <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                  Secure your messages with optional passcodes to ensure only the intended recipient can view them.
                </p>
              </div>
              
              <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
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
                  Image Attachments
                </h3>
                <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                  Add images to your messages to make them more impactful and personal.
                </p>
              </div>
              
              <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
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
                  HD Video Reactions
                </h3>
                <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                  Capture high-quality reaction videos that you can download, share, or keep for memories.
                </p>
              </div>
              
              <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
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
                <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                  Track message views, reaction rates, and manage all your content from a single dashboard.
                </p>
              </div>
            </div>
          </section>
          
          {/* Use Cases Section */}
          <section>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Perfect For
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-white p-5 shadow-md dark:bg-neutral-800">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                  Surprise Announcements
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                  Pregnancy announcements, engagement news, job promotions, and other exciting life updates.
                </p>
              </div>
              
              <div className="rounded-lg bg-white p-5 shadow-md dark:bg-neutral-800">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                  Special Occasions
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                  Birthdays, anniversaries, holidays, and other celebrations where reactions matter.
                </p>
              </div>
              
              <div className="rounded-lg bg-white p-5 shadow-md dark:bg-neutral-800">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                  Creative Content
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                  Content creators, influencers, and brands looking to capture authentic audience reactions.
                </p>
              </div>
            </div>
          </section>
          
          {/* end of content sections */}
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
                  to={user ? '/create' : '/login'}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-primary-600 hover:bg-primary-50"
                >
                  {user ? 'Create Message' : 'Get Started'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;