import React, { useState, useRef } from 'react';
import { classNames } from '../../utils/classNames';
import { MESSAGE_ERRORS } from '../constants/errorMessages';

interface PasscodeEntryProps {
  onSubmit: (passcode: string) => Promise<boolean>;
  onCancel?: () => void;
  maxAttempts?: number;
  className?: string;
}

const PasscodeEntry: React.FC<PasscodeEntryProps> = ({
  onSubmit,
  onCancel,
  maxAttempts = 5,
  className,
}) => {
  const [passcode, setPasscode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus the input field when the component mounts
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Handle passcode change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasscode(e.target.value);
    setError(null);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passcode.trim()) {
      setError('Please enter a passcode');
      return;
    }
    
    if (attempts >= maxAttempts) {
      setError(`Maximum number of attempts (${maxAttempts}) reached. Please try again later.`);
      return;
    }
    
    try {
      setIsLoading(true);
      const isSuccess = await onSubmit(passcode);
      
      if (!isSuccess) {
        setAttempts(prev => prev + 1);
        setError(MESSAGE_ERRORS.INVALID_PASSCODE);
        setPasscode('');
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Remaining attempts message
  const getRemainingAttemptsMessage = () => {
    const remaining = maxAttempts - attempts;
    if (remaining <= 3) {
      return `${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining`;
    }
    return null;
  };
  
  return (
    <div 
      className={classNames(
        'rounded-lg border border-neutral-200 bg-white p-6 shadow-md dark:border-neutral-700 dark:bg-neutral-800',
        className || ''
      )}
    >
      <h3 className="text-center text-xl font-semibold text-neutral-900 dark:text-white">
        This message is protected
      </h3>
      
      <p className="mt-2 text-center text-neutral-600 dark:text-neutral-300">
        Please enter the passcode to view this message
      </p>
      
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="relative">
          <input
            ref={inputRef}
            type="password"
            value={passcode}
            onChange={handleChange}
            disabled={isLoading || attempts >= maxAttempts}
            placeholder="Enter passcode"
            className="w-full rounded-md border border-neutral-300 px-4 py-2 pr-10 placeholder-neutral-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:placeholder-neutral-500 dark:focus:border-primary-400 dark:focus:ring-primary-400 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-400"
          />
          
          {isLoading && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 animate-spin text-neutral-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        
        {getRemainingAttemptsMessage() && (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {getRemainingAttemptsMessage()}
          </p>
        )}
        
        <div className="mt-4 flex justify-between space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !passcode.trim() || attempts >= maxAttempts}
            className={classNames(
              'flex-1 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-primary-700 dark:hover:bg-primary-600',
              onCancel ? 'flex-1' : 'w-full'
            )}
          >
            {isLoading ? 'Verifying...' : 'Submit'}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          If you don't know the passcode, please contact the person who shared this message with you.
        </p>
      </div>
    </div>
  );
};

export default PasscodeEntry;