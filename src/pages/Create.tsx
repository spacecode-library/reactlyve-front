import React from 'react';
import { useAuth } from '../context/AuthContext';
import MessageForm from '../components/sender/MessageForm';
import MainLayout from '../layouts/MainLayout';

const Create: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Create a Surprise Message
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Craft your message, share it with friends, and capture their authentic reactions.
          </p>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
          <div className="mb-6 flex items-center border-b border-neutral-200 pb-4 dark:border-neutral-700">
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
              <img
                src={user?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`}
                alt={user?.name || 'User'}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {user?.email || ''}
              </p>
            </div>
          </div>
          
          <MessageForm />
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              How It Works
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="mt-2 text-base font-medium text-neutral-900 dark:text-white">
                  Create
                </h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Craft your message and add an optional image.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
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
                <h3 className="mt-2 text-base font-medium text-neutral-900 dark:text-white">
                  Share
                </h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Send the link to your recipient through any channel.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
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
                <h3 className="mt-2 text-base font-medium text-neutral-900 dark:text-white">
                  Capture
                </h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Receive their authentic reaction video in your dashboard.
                </p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Tips for Great Reactions
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
              <li className="flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5 flex-shrink-0 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Make it personal - messages from someone they know get better reactions.</span>
              </li>
              <li className="flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5 flex-shrink-0 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Add an image for more impact - photos are worth 1,000 words!</span>
              </li>
              <li className="flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5 flex-shrink-0 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Use the passcode for extra surprise - tell them not to share it with anyone else.</span>
              </li>
              <li className="flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5 flex-shrink-0 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Let them know they'll be recorded - but don't spoil the message content!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Create;