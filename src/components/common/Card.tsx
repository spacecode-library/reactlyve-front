import React from 'react';
import { classNames } from '../../utils/classNames';

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  hoverable?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  hoverable = false,
  shadow = 'md',
}) => {
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-md',
  };

  return (
    <div
      className={classNames(
        'overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-850',
        shadowClasses[shadow],
        hoverable && 'transition-shadow hover:shadow-lg',
        className || ''
      )}
    >
      {(title || subtitle) && (
        <div
          className={classNames(
            'border-b border-neutral-200 px-6 py-4 dark:border-neutral-800',
            headerClassName || ''
          )}
        >
          {title && (
            <h3 className="text-lg font-medium leading-6 text-neutral-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div
        className={classNames(
          'px-6 py-4',
          bodyClassName || ''
        )}
      >
        {children}
      </div>
      {footer && (
        <div
          className={classNames(
            'border-t border-neutral-200 bg-neutral-50 px-6 py-3 dark:border-neutral-800 dark:bg-neutral-900',
            footerClassName || ''
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;