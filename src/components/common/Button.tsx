import React, { ButtonHTMLAttributes, ElementType, forwardRef } from 'react';
import { classNames } from '../../utils/classNames';

// Extend ButtonProps to include the 'as' prop
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  as?: ElementType; // Add 'as' prop to allow rendering as different elements
  href?: string; // For when Button is rendered as an anchor
  target?: string; // For when Button is rendered as an anchor
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      disabled,
      as: Component = 'button', // Default to button element
      href,
      target,
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed';
    
    // Size classes
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs rounded',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-6 py-3 text-base rounded-md',
    };
    
    // Variant classes
    const variantClasses = {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 disabled:bg-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:disabled:bg-primary-800',
      secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500 disabled:bg-secondary-300 dark:bg-secondary-600 dark:hover:bg-secondary-700 dark:disabled:bg-secondary-800',
      outline: 'border border-neutral-300 bg-transparent text-neutral-800 hover:bg-neutral-50 focus:ring-neutral-500 disabled:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:disabled:bg-neutral-800',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 disabled:bg-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:disabled:bg-red-800',
      ghost: 'bg-transparent text-neutral-800 hover:bg-neutral-100 focus:ring-neutral-500 disabled:text-neutral-400 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:disabled:text-neutral-600',
    };
    
    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';
    
    // Combine all classes
    const buttonClasses = classNames(
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      widthClasses,
      className || ''
    );
    
    // Props specifically for anchor elements
    const anchorProps = Component === 'a' ? { href, target } : {};
    
    return (
      <Component
        ref={ref as any} // Cast ref to any to avoid TypeScript errors when using a custom component
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...anchorProps}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
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
            Loading...
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </Component>
    );
  }
);

Button.displayName = 'Button';

export default Button;