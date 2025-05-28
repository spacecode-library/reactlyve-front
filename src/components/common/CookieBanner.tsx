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
        <div className="flex items-center mt-2 sm:mt-0 sm:ml-4 flex-shrink-0"> {/* Added flex-shrink-0 */}
          <Button
            onClick={handleAccept} // Using same handler for now
            size="sm"
            className="px-4 py-2 rounded-md text-sm font-medium \
                       text-neutral-700 bg-transparent border border-neutral-400 hover:bg-neutral-100 \
                       dark:text-neutral-300 dark:border-neutral-600 dark:hover:bg-neutral-700 \
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-2" // Added mr-2
          >
            Reject
          </Button>
          <Button
            onClick={handleAccept}
            size="sm"
            className="px-4 py-2 rounded-md shadow-sm text-sm font-medium \
                       text-neutral-800 bg-white hover:bg-neutral-200 \
                       dark:text-white dark:bg-primary-500 dark:hover:bg-primary-600 \
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Accept & Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
