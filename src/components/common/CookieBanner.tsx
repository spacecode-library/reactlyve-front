import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button'; // Assuming a Button component exists

const COOKIE_CONSENT_KEY = 'cookieConsentDismissed_v1'; // Added _v1 for versioning

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    if (localStorage.getItem(COOKIE_CONSENT_KEY) !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-800 text-white p-4 shadow-lg z-50 dark:bg-neutral-900">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <p className="text-sm mb-2 sm:mb-0 sm:mr-4">
          We use cookies to enhance your browsing experience and analyze site traffic.
          By continuing to visit this site you agree to our use of cookies. 
          Learn more in our{' '}
          <Link to="/cookie-policy" className="underline hover:text-primary-300 font-semibold">
            Cookie Policy
          </Link>
          .
        </p>
        <Button
          onClick={handleAccept}
          variant="primary" // Or a suitable variant for your Button component
          size="sm"
          className="bg-white text-neutral-800 hover:bg-neutral-200 dark:bg-primary-500 dark:text-white dark:hover:bg-primary-600" // Ensure good contrast
        >
          Accept & Close
        </Button>
      </div>
    </div>
  );
};

export default CookieBanner;
