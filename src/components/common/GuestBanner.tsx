import React from 'react';
import { useAuth } from '../../context/AuthContext';

const GuestBanner: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'guest') {
    return null;
  }

  const { maxMessagesPerMonth, maxReactionsPerMonth, maxReactionsPerMessage } = user;

  return (
    <div className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-sm text-center p-2">
      You are a guest user and are limited to {maxMessagesPerMonth ?? 0} messages, {maxReactionsPerMonth ?? 0} total reactions and {maxReactionsPerMessage ?? 0} reactions per message. To upgrade please contact{' '}
      <a href="mailto:support@reactlyve.com" className="underline">support@reactlyve.com</a>.
    </div>
  );
};

export default GuestBanner;
