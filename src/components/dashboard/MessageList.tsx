import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MessageWithReactions } from '../../types/message';
import { formatDate, formatRelativeTime, truncateString } from '../../utils/formatters';
import { classNames } from '../../utils/classNames';
import Button from '../common/Button';
import Card from '../common/Card';

interface MessageListProps {
  messages: MessageWithReactions[];
  onDeleteMessage?: (messageId: string) => void;
  onViewReaction?: (reactionId: string) => void;
  loading?: boolean;
  className?: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  onDeleteMessage,
  onViewReaction,
  loading = false,
  className,
}) => {
  // State for sorting and filtering
  const [sortBy, setSortBy] = useState<'date' | 'reactions'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'withReactions' | 'noReactions'>('all');
  
  // Filter and sort messages
  const filteredAndSortedMessages = useMemo(() => {
    // Apply filters
    let result = [...messages];
    console.log('Messages:', result);
    if (filterBy === 'withReactions') {
      result = result.filter(message => message.reactions.length > 0);
    } else if (filterBy === 'noReactions') {
      result = result.filter(message => message.reactions.length === 0);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'reactions') {
        comparison = a.reactions.length - b.reactions.length;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [messages, sortBy, sortOrder, filterBy]);
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };
  
  // Empty state
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
  
  // Loading state
  if (loading) {
    return (
      <div className={classNames('flex justify-center py-8', className || '')}>
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className={className}>
      {/* Filters and sorting controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <label htmlFor="filter-by" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Show:
          </label>
          <select
            id="filter-by"
            value={filterBy}
            onChange={e => setFilterBy(e.target.value as any)}
            className="rounded-md border-neutral-300 py-1 pl-2 pr-8 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="all">All Messages</option>
            <option value="withReactions">With Reactions</option>
            <option value="noReactions">No Reactions</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="sort-by" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Sort by:
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="rounded-md border-neutral-300 py-1 pl-2 pr-8 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="date">Date</option>
            <option value="reactions">Reactions</option>
          </select>
          
          <button
            type="button"
            onClick={toggleSortOrder}
            className="rounded-md border border-neutral-300 p-1 text-neutral-500 hover:text-neutral-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {sortOrder === 'asc' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Message list */}
      <div className="space-y-4">
        {filteredAndSortedMessages.map(message => (
          <Card
            key={message.id}
            className="transition-shadow hover:shadow-md"
            hoverable
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
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
                  <span
                    className="cursor-help"
                    title={formatDate(message.createdat)}
                  >
                    {formatRelativeTime(message.createdat)}
                  </span>
                  {/* <span className="mx-1">&bull;</span> */}
                  {/* <span>
                    {message.viewCount === 0
                      ? 'Not viewed yet'
                      : `${message.viewCount} ${message.viewCount === 1 ? 'view' : 'views'}`}
                  </span>
                  <span className="mx-1">&bull;</span>
                  <span>
                    {message.length === 0
                      ? 'No reactions'
                      : `${message.length} ${message.length === 1 ? 'reaction' : 'reactions'}`}
                  </span> */}
                </div>
              </div>
              
              <div className="flex space-x-2">
                {/* View link button */}
                <Button
                  as="a"
                  href={message.shareableLink}
                  target="_blank"
                  variant="outline"
                  size="sm"
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
                
                {/* Delete button */}
                {onDeleteMessage && (
                  <Button
                    variant="outline"
                    size="sm"
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
            
            {/* Reactions preview (if any) */}
            {message.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Reactions
                </h4>
                <div className="mt-2 flex space-x-2 overflow-x-auto pb-2">
                  {message.map(reaction => (
                    <button
                      key={reaction.id}
                      type="button"
                      onClick={() => onViewReaction?.(reaction.id)}
                      className="relative flex-shrink-0 overflow-hidden rounded-md bg-neutral-100 shadow-sm dark:bg-neutral-700"
                    >
                      {reaction.thumbnailUrl ? (
                        <img
                          src={reaction.thumbnailUrl}
                          alt="Reaction thumbnail"
                          className="h-16 w-28 object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-28 items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-neutral-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                        <span className="text-xs font-medium text-white">
                          View Reaction
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
      
      {/* Empty state if filtered results are empty */}
      {filteredAndSortedMessages.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">
            No messages match the current filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilterBy('all');
              setSortBy('date');
              setSortOrder('desc');
            }}
            className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageList;