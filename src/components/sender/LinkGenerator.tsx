import React, { useState, useCallback, useRef } from 'react';
import { classNames } from '../../utils/classNames';
import { showToast } from '../common/ErrorToast';

interface LinkGeneratorProps {
  shareableLink: string;
  hasPasscode: boolean;
  passcode?: string;
  className?: string;
}

const LinkGenerator: React.FC<LinkGeneratorProps> = ({
  shareableLink,
  hasPasscode,
  passcode,
  className,
}) => {
  const [showQrCode, setShowQrCode] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const passcodeInputRef = useRef<HTMLInputElement>(null);
  
  // Copy link to clipboard
  const handleCopyLink = useCallback(async () => {
    if (shareableLink) {
      try {
        await navigator.clipboard.writeText(shareableLink);
        showToast({ message: 'Link copied to clipboard', type: 'success' });
      } catch (error) {
        // Fallback method for browsers that don't support clipboard API
        if (linkInputRef.current) {
          linkInputRef.current.select();
          document.execCommand('copy');
          showToast({ message: 'Link copied to clipboard', type: 'success' });
        } else {
          showToast({ message: 'Failed to copy link', type: 'error' });
        }
      }
    }
  }, [shareableLink]);
  
  // Copy passcode to clipboard
  const handleCopyPasscode = useCallback(async () => {
    if (passcode) {
      try {
        await navigator.clipboard.writeText(passcode);
        showToast({ message: 'Passcode copied to clipboard', type: 'success' });
      } catch (error) {
        // Fallback method
        if (passcodeInputRef.current) {
          passcodeInputRef.current.select();
          document.execCommand('copy');
          showToast({ message: 'Passcode copied to clipboard', type: 'success' });
        } else {
          showToast({ message: 'Failed to copy passcode', type: 'error' });
        }
      }
    }
  }, [passcode]);
  
  // Generate QR code URL using a free API
  const getQrCodeUrl = useCallback(() => {
    if (!shareableLink) return '';
    
    // Using the Google Charts API to generate QR code
    const encodedUrl = encodeURIComponent(shareableLink);
    return `https://chart.googleapis.com/chart?cht=qr&chl=${encodedUrl}&chs=200x200&choe=UTF-8&chld=L|2`;
  }, [shareableLink]);
  
  // Share via email
  const handleShareViaEmail = useCallback(() => {
    if (shareableLink) {
      const subject = 'Check out this surprise message!';
      let body = `I've sent you a surprise message. Click the link below to view it:\n\n${shareableLink}`;
      
      if (hasPasscode && passcode) {
        body += `\n\nYou'll need this passcode to view it: ${passcode}`;
      }
      
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink, '_blank');
    }
  }, [shareableLink, hasPasscode, passcode]);
  
  // Share using Web Share API if available
  const handleShare = useCallback(() => {
    if (!shareableLink) return;
    
    if (navigator.share) {
      let text = 'Check out this surprise message!';
      if (hasPasscode && passcode) {
        text += ` (Passcode: ${passcode})`;
      }
      
      navigator.share({
        title: 'Reactlyve Message',
        text,
        url: shareableLink,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback if Web Share API is not available
      handleShareViaEmail();
    }
  }, [shareableLink, hasPasscode, passcode, handleShareViaEmail]);
  
  if (!shareableLink) {
    return null;
  }
  
  return (
    <div className={classNames('rounded-lg bg-white p-4 shadow-md dark:bg-neutral-800', className || '')}>
      <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
        Your message is ready to share!
      </h3>
      
      {/* Shareable link */}
      <div className="mt-3">
        <label htmlFor="shareable-link" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Shareable Link
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            ref={linkInputRef}
            type="text"
            id="shareable-link"
            value={shareableLink}
            readOnly
            className="flex-1 rounded-l-md border border-neutral-300 px-3 py-2 text-neutral-900 focus:border-primary-500 focus:ring-primary-500 disabled:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:disabled:bg-neutral-900"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center rounded-r-md border border-l-0 border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
            </svg>
            <span className="ml-1">Copy</span>
          </button>
        </div>
      </div>
      
      {/* Passcode (if applicable) */}
      {hasPasscode && passcode && (
        <div className="mt-3">
          <label htmlFor="passcode" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Passcode
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              ref={passcodeInputRef}
              type="text"
              id="passcode"
              value={passcode}
              readOnly
              className="flex-1 rounded-l-md border border-neutral-300 px-3 py-2 text-neutral-900 focus:border-primary-500 focus:ring-primary-500 disabled:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:disabled:bg-neutral-900"
            />
            <button
              type="button"
              onClick={handleCopyPasscode}
              className="inline-flex items-center rounded-r-md border border-l-0 border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
              </svg>
              <span className="ml-1">Copy</span>
            </button>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Share this passcode separately with the recipient. They'll need it to view your message.
          </p>
        </div>
      )}
      
      {/* Share options */}
      <div className="mt-4 flex space-x-2">
        <button
          type="button"
          onClick={handleShare}
          className="flex flex-1 items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          Share
        </button>
        
        <button
          type="button"
          onClick={handleShareViaEmail}
          className="flex items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <span className="ml-1">Email</span>
        </button>
        
        <button
          type="button"
          onClick={() => setShowQrCode(!showQrCode)}
          className="flex items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          <span className="ml-1">QR</span>
        </button>
      </div>
      
      {/* QR Code */}
      {showQrCode && (
        <div className="mt-4 flex flex-col items-center">
          <div className="overflow-hidden rounded-lg bg-white p-2 shadow dark:bg-neutral-700">
            <img
              src={getQrCodeUrl()}
              alt="QR Code"
              className="h-48 w-48"
            />
          </div>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Scan this QR code to open the message on another device.
          </p>
        </div>
      )}
    </div>
  );
};

export default LinkGenerator;