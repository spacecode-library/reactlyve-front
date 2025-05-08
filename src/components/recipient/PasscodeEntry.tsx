import React, { useState, useCallback, useRef, useEffect } from 'react';
import { classNames } from '../../utils/classNames';
import Button from '../common/Button';

interface PasscodeEntryProps {
  onSubmitPasscode: (passcode: string) => Promise<boolean>;
  maxAttempts?: number;
  className?: string;
}

const PasscodeEntry: React.FC<PasscodeEntryProps> = ({
  onSubmitPasscode,
  maxAttempts = 5,
  className,
}) => {
  const [passcode, setPasscode] = useState<string>('');
  const [attemptsLeft, setAttemptsLeft] = useState<number>(maxAttempts);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState<boolean>(false);
  const passcodeInputRef = useRef<HTMLInputElement>(null);
  
  // Focus the input on mount
  useEffect(() => {
    if (passcodeInputRef.current) {
      passcodeInputRef.current.focus();
    }
  }, []);
  
  // Handle passcode change
  const handlePasscodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPasscode(e.target.value);
    setError(null);
  }, []);
  
  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passcode.trim()) {
      setError('Please enter the passcode.');
      return;
    }
    
    if (attemptsLeft <= 0) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const isValid = await onSubmitPasscode(passcode);
      
      if (!isValid) {
        // Decrement attempts left
        const newAttemptsLeft = attemptsLeft - 1;
        setAttemptsLeft(newAttemptsLeft);
        
        // Set error message
        if (newAttemptsLeft <= 0) {
          setError('Too many failed attempts. Please try again later.');
        } else {
          setError(`Incorrect passcode. You have ${newAttemptsLeft} ${newAttemptsLeft === 1 ? 'attempt' : 'attempts'} left.`);
        }
        
        // Trigger shake animation
        setShake(true);
        setTimeout(() => setShake(false), 600);
        
        // Clear the input
        setPasscode('');
        
        // Focus the input
        if (passcodeInputRef.current) {
          passcodeInputRef.current.focus();
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [passcode, attemptsLeft, onSubmitPasscode]);
  
  return (
    <div className={classNames('mx-auto max-w-md', className || '')}>
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12 text-primary-500 dark:text-primary-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          
          <h2 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
            Protected Message
          </h2>
          
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            This message is protected with a passcode. Please enter the passcode to view it.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-6">
          <div>
            <label
              htmlFor="passcode"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Passcode
            </label>
            
            <div className="relative mt-1">
              <input
                ref={passcodeInputRef}
                type="text"
                id="passcode"
                value={passcode}
                onChange={handlePasscodeChange}
                placeholder="Enter passcode"
                className={classNames(
                  'block w-full rounded-md border border-neutral-300 px-4 py-3 text-center text-lg shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-700 dark:text-white',
                  error ? 'border-red-300 dark:border-red-700' : '',
                  shake ? 'animate-[shake_0.5s_ease-in-out]' : ''
                )}
                style={{
                  letterSpacing: '0.2em',
                }}
                disabled={isSubmitting || attemptsLeft <= 0}
                maxLength={20}
                autoComplete="off"
              />
            </div>
            
            {error && (
              <p className="mt-2 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
          
          <div className="mt-4">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting || !passcode.trim() || attemptsLeft <= 0}
              fullWidth
            >
              {isSubmitting ? 'Verifying...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasscodeEntry;