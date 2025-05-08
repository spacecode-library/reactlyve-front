import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white shadow-sm dark:bg-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                Reactlyve
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-primary"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-white">
              Capture Real Reactions to Your Surprise Messages
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-600 dark:text-neutral-300">
              Send surprise messages with Reactlyve and record your friends' reactions as they open them.
              Share moments that matter, capture authentic responses.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/create"
                  className="btn-primary px-8 py-3 text-base"
                >
                  Create New Message
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary px-8 py-3 text-base"
                >
                  Get Started
                </Link>
              )}
              <Link
                to="/about"
                className="btn-outline px-8 py-3 text-base"
              >
                Learn More
              </Link>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-center text-3xl font-bold text-neutral-900 dark:text-white">
              How It Works
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                  1
                </div>
                <h3 className="mt-4 text-xl font-medium text-neutral-900 dark:text-white">
                  Create a Surprise
                </h3>
                <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                  Craft your message, add images, and generate a unique link to share.
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                  2
                </div>
                <h3 className="mt-4 text-xl font-medium text-neutral-900 dark:text-white">
                  Share the Link
                </h3>
                <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                  Send your surprise link to friends, family, or colleagues via email or messaging.
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                  3
                </div>
                <h3 className="mt-4 text-xl font-medium text-neutral-900 dark:text-white">
                  Capture Reactions
                </h3>
                <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                  When they open your message, their reaction is recorded and sent back to you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white py-6 dark:bg-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-neutral-500 dark:text-neutral-400">
            © {new Date().getFullYear()} Reactlyve. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;