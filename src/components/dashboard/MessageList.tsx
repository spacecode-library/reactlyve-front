import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CopyIcon } from 'lucide-react';
import { MessageWithReactions } from '../../types/message';
import { formatDate, formatRelativeTime, truncateString } from '../../utils/formatters';
import { classNames } from '../../utils/classNames';
import Button from '../common/Button';
import Card from '../common/Card';
import { normalizeMessage } from '@/utils/normalizeKeys';
import type { Reaction } from '../../types/reaction';
import LinksModal from './LinksModal';

interface MessageListProps {
  messages: MessageWithReactions[];
  onDeleteMessage?: (messageId: string) => void;
  onViewMessage?: (id: string) => void;
  onViewReaction?: (reactionId: string) => void;
  loading?: boolean;
  className?: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  onDeleteMessage,
  onViewMessage,
  onViewReaction,
  loading = false,
  className,
}) => {
  const [linksModalInfo, setLinksModalInfo] = useState<{ id: string; passcode?: string | null } | null>(null);
  const normalizedMessages = useMemo(() => {
    return messages.map(normalizeMessage);
  }, [messages]);
  const handleCopyLink = async (link: string | undefined) => {
    if (!link) {
      toast.error('Shareable link is not available.');
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard');
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link.');
    }
  };

  const openLinksModal = (id: string, passcode?: string | null) => {
    setLinksModalInfo({ id, passcode });
  };

  const closeLinksModal = () => setLinksModalInfo(null);

  if (!loading && messages.length === 0) {
    return (
      <div className={classNames('text-center', className || '')}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-neutral-900 dark:text-white">
          No messages yet
        </h3>
        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
          Create your first surprise message to get started.
        </p>
        <div className="mt-4">
          <Link
            to="/create"
            className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="-ml-1 mr-2 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create Message
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={classNames('flex justify-center py-8', className || '')}>
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {normalizedMessages.map((message) => (
          <Card
            key={message.id}
            className="transition-shadow hover:shadow-md"
            hoverable
          >
            {/* Main container for content and buttons: stacks on mobile (default), row on sm+ */}
            <div className="flex flex-col items-start sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 pr-0 w-full sm:pr-4 sm:w-auto"> {/* Content: full width on mobile, auto on sm+ */}
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                    {truncateString(message.content, 60)}
                  </h3>
                  {message.hasPasscode && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1 h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Protected
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                  <span className="cursor-help" title={formatDate(message.createdAt)}>
                    {formatRelativeTime(message.createdAt)}
                  </span>
                </div>
                {Array.isArray(message.reactions) && message.reactions.length > 0 && (
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                {message.reactions.length} reaction{message.reactions.length > 1 ? 's' : ''}
                </p>
              )}
              </div>

              {/* Container for View/Delete buttons: vertical column on mobile, row on sm+ */}
              <div className="flex flex-col space-y-2 mt-3 w-full sm:flex-row sm:space-y-0 sm:space-x-2 sm:mt-0 sm:w-auto">
                {onViewMessage && (
                  <Button
                    onClick={() => onViewMessage(message.id)}
                    target="_blank"
                    variant="outline"
                    size="sm"
                    className="py-2.5 w-full sm:w-auto" // Full width on mobile, auto on sm+
                    leftIcon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    }
                  >
                    View
                  </Button>
                )}
                {message.shareableLink && (
                  <Button
                    onClick={() => handleCopyLink(message.shareableLink)}
                    variant="outline"
                    size="sm"
                    className="py-2.5 w-full sm:w-auto"
                    leftIcon={<CopyIcon className="h-4 w-4" />}
                  >
                    Copy Link
                  </Button>
                )}
                {message.id && (
                  <Button
                    onClick={() => openLinksModal(message.id, message.passcode)}
                    variant="outline"
                    size="sm"
                    className="py-2.5 w-full sm:w-auto"
                  >
                    Manage Links
                  </Button>
                )}
                {onDeleteMessage && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="py-2.5 w-full sm:w-auto" // Full width on mobile, auto on sm+
                    onClick={() => onDeleteMessage(message.id)}
                    leftIcon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    }
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      {linksModalInfo && (
        <LinksModal
          isOpen={!!linksModalInfo}
          onClose={closeLinksModal}
          messageId={linksModalInfo.id}
          passcode={linksModalInfo.passcode || undefined}
        />
      )}
    </div>
  );
};

export default MessageList;
