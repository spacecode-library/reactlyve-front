import React, { useState, useCallback, useEffect } from 'react';
import { getPasswordStrength } from '../../utils/validators';
import { classNames } from '../../utils/classNames';

interface PasscodeCreatorProps {
  onPasscodeChange: (passcode: string) => void;
  onTogglePasscode: (enabled: boolean) => void;
  enabled?: boolean;
  minLength?: number;
  className?: string;
}

const PasscodeCreator: React.FC<PasscodeCreatorProps> = ({
  onPasscodeChange,
  onTogglePasscode,
  enabled = false,
  minLength = 4,
  className,
}) => {
  const [passcode, setPasscode] = useState<string>('');
  const [strength, setStrength] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  // Calculate password strength when passcode changes
  useEffect(() => {
    if (passcode) {
      setStrength(getPasswordStrength(passcode));
      
      // Validate min length
      if (passcode.length < minLength) {
        setError(`Passcode must be at least ${minLength} characters long.`);
      } else {
        setError(null);
      }
    } else {
      setStrength(0);
      setError(null);
    }
  }, [passcode, minLength]);
  
  // Notify parent when passcode changes and is valid
  useEffect(() => {
    if (enabled && passcode && !error) {
      onPasscodeChange(passcode);
    } else if (enabled && (!passcode || error)) {
      onPasscodeChange(''); // Empty passcode signals invalid
    }
  }, [passcode, error, enabled, onPasscodeChange]);
  
  // Handle passcode change
  const handlePasscodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPasscode(e.target.value);
  }, []);
  
  // Handle toggle change
  const handleToggleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    onTogglePasscode(isEnabled);
    
    // If disabled, clear passcode
    if (!isEnabled) {
      setPasscode('');
    }
  }, [onTogglePasscode]);
  
  // Generate passcode suggestions
  const generatePasscode = useCallback(() => {
    // Generate a random passcode (6-8 chars, mix of letters, numbers, symbols)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    const length = Math.floor(Math.random() * 3) + 6; // 6-8 chars
    let newPasscode = '';
    
    for (let i = 0; i < length; i++) {
      newPasscode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setPasscode(newPasscode);
  }, []);
  
  // Render strength indicator
  const renderStrengthIndicator = () => {
    const getStrengthColor = (s: number) => {
      if (s <= 1) return 'bg-red-500';
      if (s === 2) return 'bg-yellow-500';
      if (s === 3) return 'bg-green-500';
      return 'bg-green-600';
    };
    
    const getStrengthLabel = (s: number) => {
      if (s <= 1) return 'Weak';
      if (s === 2) return 'Fair';
      if (s === 3) return 'Good';
      return 'Strong';
    };
    
    return (
      <div className="mt-1">
        <div className="flex h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
          <div
            className={classNames(
              'transition-all duration-300',
              getStrengthColor(strength)
            )}
            style={{ width: `${(strength / 4) * 100}%` }}
          ></div>
        </div>
        {passcode && (
          <p
            className={classNames(
              'mt-1 text-xs',
              strength <= 1
                ? 'text-red-600 dark:text-red-400'
                : strength === 2
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-green-600 dark:text-green-400'
            )}
          >
            {getStrengthLabel(strength)}
          </p>
        )}
      </div>
    );
  };
  
  return (
    <div className={classNames('space-y-3', className || '')}>
      {/* Toggle switch */}
      <div className="flex items-center">
        <input
          id="passcode-toggle"
          type="checkbox"
          checked={enabled}
          onChange={handleToggleChange}
          className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-600 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-primary-500"
        />
        <label
          htmlFor="passcode-toggle"
          className="ml-2 text-sm font-medium text-neutral-900 dark:text-neutral-100"
        >
          Protect this message with a passcode
        </label>
      </div>
      
      {/* Passcode input */}
      {enabled && (
        <div>
          <div className="relative">
            <input
              type="text"
              value={passcode}
              onChange={handlePasscodeChange}
              placeholder="Enter passcode"
              className={classNames(
                'w-full rounded-md border border-neutral-300 py-2 pl-3 pr-20 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-primary-500 dark:focus:ring-primary-500',
                error ? 'border-red-300 dark:border-red-700' : ''
              )}
            />
            <button
              type="button"
              onClick={generatePasscode}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Generate
            </button>
          </div>
          
          {/* Strength indicator */}
          {renderStrengthIndicator()}
          
          {/* Error message */}
          {error && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          
          {/* Passcode help text */}
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Share this passcode separately with the recipient. They'll need it to view your message.
          </p>
        </div>
      )}
    </div>
  );
};

export default PasscodeCreator;