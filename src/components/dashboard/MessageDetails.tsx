import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../../types/message';
import ReactionViewer from './ReactionViewer';
import { formatDate } from '../../utils/formatters';
import Button from '../common/Button';
import { normalizeMessage } from '../../utils/normalizeKeys';

interface MessageDetailsProps {
  message: Message;
  onDeleteReaction?: (reactionId: string) => void;
}

const MessageDetails: React.FC<MessageDetailsProps> = ({ message, onDeleteReaction }) => {
  const normalizedMessage = normalizeMessage(message);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showQrCode, setShowQrCode] = useState(false);

  const getQrCodeUrl = () => {
    if (!normalizedMessage.shareableLink) return '';
    const encodedUrl = encodeURIComponent(normalizedMessage.shareableLink);
    return `https://chart.googleapis.com/chart?cht=qr&chl=${encodedUrl}&chs=250x250&choe=UTF-8&chld=L|2`;
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.warn("Unmuted autoplay was prevented by the browser:", error);
        // Browser prevented unmuted autoplay.
        // Controls are visible, so user can manually play.
      });
    }
  }, [normalizedMessage.videoUrl]); // Re-run if videoUrl changes

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
      {normalizedMessage.imageUrl && normalizedMessage.mediaType === 'image' && (
        <img src={normalizedMessage.imageUrl} alt="Message media" className="rounded-md mb-4 w-full" />
      )}
      {normalizedMessage.videoUrl && normalizedMessage.mediaType === 'video' && (
        <video ref={videoRef} src={normalizedMessage.videoUrl} controls autoPlay playsInline className="rounded-md mb-4 w-full" />
      )}

      {/* Shareable Link */}
      <div className="mb-6">
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Shareable Link</p>
        <div className="flex items-center space-x-2">
          <input
            value={normalizedMessage.shareableLink}
            readOnly
            className="flex-1 rounded border border-neutral-300 dark:border-neutral-600 p-2 text-sm dark:bg-neutral-800 dark:text-white"
          />
          <Button
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(normalizedMessage.shareableLink);
              alert('Link copied!');
            }}
          >
            Copy
          </Button>
          <button
            type="button"
            onClick={() => setShowQrCode(!showQrCode)}
            style={{
              padding: '0.25rem 0.5rem', // Equivalent to size="sm" roughly
              border: '1px solid #6b7280', // A basic outline style
              borderRadius: '0.25rem',
              backgroundColor: 'transparent',
              color: 'inherit', // Inherit text color from parent
              cursor: 'pointer',
              marginLeft: '0.5rem' // Keep spacing similar to space-x-2
            }}
          >
            {showQrCode ? 'Hide QR Code' : 'Show QR Code'}
          </button>
        </div>
        {showQrCode && (
          <div className="mt-4 flex flex-col items-center">
            <div className="p-2 bg-white rounded-lg shadow-sm inline-block">
              <img 
                src={getQrCodeUrl()} 
                alt="QR Code for shareable link" 
                className="w-48 h-48 md:w-56 md:h-56" // Responsive size
              />
            </div>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Scan this QR code to access the shareable link.
            </p>
          </div>
        )}
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
