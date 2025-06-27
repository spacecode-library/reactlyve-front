import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div data-theme-target className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 text-center dark:bg-neutral-900">
      <h1 className="text-9xl font-bold text-primary-500">404</h1>
      <h2 className="mt-4 text-3xl font-bold text-neutral-900 dark:text-white">
        Page Not Found
      </h2>
      <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center rounded-md bg-primary-500 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-600 dark:hover:bg-primary-700"
      >
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;