import { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../../context/AuthContext';
import { classNames } from '../../utils/classNames';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm dark:bg-neutral-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/vite.svg" alt="Reactlyve Logo" className="h-8 mr-2" />
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                Reactlyve
              </span>
            </Link>
            <div className="hidden md:ml-10 md:block">
              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className="rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-white"
                >
                  Home
                </Link>
                {user && (
                  <>
                    <Link
                      to="/create"
                      className="rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-white"
                    >
                      Create
                    </Link>
                    <Link
                      to="/dashboard"
                      className="rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-white"
                    >
                      Dashboard
                    </Link>
                  </>
                )}
                <Link
                  to="/about"
                  className="rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-white"
                >
                  About
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center">

            {/* Profile dropdown */}
            {user && user ? (
              <Menu as="div" className="relative ml-4">
                <div>
                  <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-neutral-800">
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.picture || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                      alt={user.name}
                    />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-800 dark:ring-neutral-700 z-50">
                    <div className="border-b border-neutral-100 px-4 py-2 dark:border-neutral-700">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{user.name}</p>
                      <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
                    </div>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={classNames(
                            active ? 'bg-neutral-100 dark:bg-neutral-700' : '',
                            'block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200'
                          )}
                        >
                          Your Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/dashboard"
                          className={classNames(
                            active ? 'bg-neutral-100 dark:bg-neutral-700' : '',
                            'block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200'
                          )}
                        >
                          Dashboard
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/create"
                          className={classNames(
                            active ? 'bg-neutral-100 dark:bg-neutral-700' : '',
                            'block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200'
                          )}
                        >
                          Create Message
                        </Link>
                      )}
                    </Menu.Item>
                    {user.role === 'admin' && (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/admin"
                            className={classNames(
                              active ? 'bg-neutral-100 dark:bg-neutral-700' : '',
                              'block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200'
                            )}
                          >
                            Admin Panel
                          </Link>
                        )}
                      </Menu.Item>
                    )}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={classNames(
                            active ? 'bg-neutral-100 dark:bg-neutral-700' : '',
                            'block w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-200'
                          )}
                        >
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <Link
                to="/login"
                className="ml-4 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-800"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;