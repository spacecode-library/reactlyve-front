import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import GuestBanner from '../components/common/GuestBanner';
import { classNames } from '../utils/classNames';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideNavbar?: boolean;
  hideFooter?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className,
  hideNavbar = false,
  hideFooter = false,
}) => {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-900">
      {!hideNavbar && <Navbar />}
      <GuestBanner />
      <main className={classNames('flex-grow', className || '')}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;