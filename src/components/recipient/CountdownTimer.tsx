import React, { useEffect, useState, useCallback } from 'react';
import { classNames } from '../../utils/classNames';

interface CountdownTimerProps {
  duration?: number; // Duration in seconds
  onComplete?: () => void;
  onCancel?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCancelButton?: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  duration = 3,
  onComplete,
  onCancel,
  className,
  size = 'md',
  showCancelButton = true,
}) => {
  const [countdown, setCountdown] = useState<number>(duration);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Size classes for the timer circle
  const sizeClasses = {
    sm: 'h-24 w-24 text-3xl',
    md: 'h-32 w-32 text-4xl',
    lg: 'h-40 w-40 text-5xl',
  };

  // Calculate the circumference of the SVG circle
  const radius = size === 'sm' ? 40 : size === 'md' ? 56 : 72;
  const circumference = 2 * Math.PI * radius;

  // Calculate the stroke-dashoffset based on the countdown progress
  const calculateStrokeDashoffset = useCallback(
    (count: number) => {
      const progress = count / duration;
      return circumference * (1 - progress);
    },
    [duration, circumference]
  );

  const [strokeDashoffset, setStrokeDashoffset] = useState<number>(0);

  // Handle cancellation
  const handleCancel = () => {
    setIsActive(false);
    onCancel?.();
  };

  // Update countdown timer
  useEffect(() => {
    if (!isActive) return;

    // Set initial stroke dash offset
    setStrokeDashoffset(calculateStrokeDashoffset(countdown));

    // If countdown is done, trigger onComplete callback
    if (countdown === 0) {
      setIsActive(false);
      onComplete?.();
      return;
    }

    // Set up interval to update countdown
    const timerId = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    // Cleanup on unmount
    return () => {
      clearTimeout(timerId);
    };
  }, [countdown, isActive, onComplete, calculateStrokeDashoffset]);

  return (
    <div className={classNames('flex flex-col items-center justify-center', className || '')}>
      <div className="relative">
        {/* SVG Circle Timer */}
        <svg
          className={classNames(
            'transform -rotate-90',
            sizeClasses[size]
          )}
          viewBox={`0 0 ${radius * 2 + 8} ${radius * 2 + 8}`}
        >
          {/* Background circle */}
          <circle
            cx={radius + 4}
            cy={radius + 4}
            r={radius}
            fill="none"
            strokeWidth="8"
            className="stroke-neutral-200 dark:stroke-neutral-700"
          />
          
          {/* Progress circle */}
          <circle
            cx={radius + 4}
            cy={radius + 4}
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="stroke-primary-500 dark:stroke-primary-400 transition-all duration-1000 ease-linear"
          />
        </svg>
        
        {/* Countdown number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold">{countdown > 0 ? countdown : ''}</span>
        </div>
      </div>
      
      {/* Cancel button */}
      {showCancelButton && (
        <button
          onClick={handleCancel}
          className="mt-4 rounded-md bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default CountdownTimer;