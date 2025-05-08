import React from 'react';
import Navbar from '../components/common/Navbar';
import { classNames } from '../utils/classNames';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideNavbar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className,
  hideNavbar = false,
}) => {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-900">
      {!hideNavbar && <Navbar />}
      <main className={classNames('flex-grow', className || '')}>
        {children}
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

export default MainLayout;