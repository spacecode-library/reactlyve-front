import React from 'react';
import { Message } from '../../types/message';
import ReactionViewer from './ReactionViewer';
import { formatDate } from '../../utils/formatters';
import Button from '../common/Button';

interface MessageDetailsProps {
  message: Message;
  onDeleteReaction?: (reactionId: string) => void;
}

const MessageDetails: React.FC<MessageDetailsProps> = ({ message, onDeleteReaction }) => {
  return (
    <div className="mx-auto w-full max-w-3xl p-6 bg-white dark:bg-neutral-900 rounded-md shadow">
      {/* Message Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Message Details</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Created on {formatDate(message.createdAt)}
        </p>
      </div>

      {/* Message Content */}
      <div className="mb-4">
        <p className="text-neutral-800 dark:text-neutral-100 whitespace-pre-wrap">{message.content}</p>
      </div>

      {/* Media Preview */}
      {message.imageUrl && message.mediaType === 'image' && (
        <img src={message.imageUrl} alt="Message media" className="rounded-md mb-4 w-full" />
      )}
      {message.imageUrl && message.mediaType === 'video' && (
        <video src={message.imageUrl} controls className="rounded-md mb-4 w-full" />
      )}

      {/* Shareable Link */}
      <div className="mb-6">
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Shareable Link</p>
        <div className="flex items-center space-x-2">
          <input
            value={message.shareableLink}
            readOnly
            className="flex-1 rounded border border-neutral-300 dark:border-neutral-600 p-2 text-sm dark:bg-neutral-800 dark:text-white"
          />
          <Button
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(message.shareableLink);
              alert('Link copied!');
            }}
          >
            Copy
          </Button>
        </div>
      </div>

      {/* Reactions */}
      {message.reactions && message.reactions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Reactions
          </h3>
          {message.reactions.map((reaction) => (
            <ReactionViewer
              key={reaction.id}
              reaction={reaction}
              messageSummary={message.content}
              onDeleteReaction={onDeleteReaction}
              className="mb-6"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageDetails;
