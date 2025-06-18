import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Message } from '../../types/message';
import ReactionViewer from './ReactionViewer';
import { formatDate } from '../../utils/formatters';
import Button from '../common/Button';
import { normalizeMessage } from '../../utils/normalizeKeys';
import Modal from '../common/Modal';
import Input from '../common/Input';
import { messagesApi } from '../../services/api';
import toast from 'react-hot-toast';

interface MessageDetailsProps {
  message: Message;
  onDeleteReaction?: (reactionId: string) => void;
  onMessageUpdate?: (updatedMessage: Message) => void;
}

const MessageDetails: React.FC<MessageDetailsProps> = ({ message, onDeleteReaction, onMessageUpdate }) => {
  const normalizedMessage = useMemo(() => {
    return normalizeMessage(message);
  }, [message]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showQrCode, setShowQrCode] = useState(false);


  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reactionLengthInput, setReactionLengthInput] = useState(normalizedMessage.reaction_length || 10);
  const [passcodeInput, setPasscodeInput] = useState(normalizedMessage.passcode || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // When the message prop changes (e.g., after an update),
    // reset the input fields to reflect the new message data.
    setReactionLengthInput(normalizedMessage.reaction_length || 10);
    setPasscodeInput(normalizedMessage.passcode || '');
  }, [normalizedMessage.reaction_length, normalizedMessage.passcode]);


  const handleOpenEditModal = () => {
    setReactionLengthInput(normalizedMessage.reaction_length || 10);
    setPasscodeInput(normalizedMessage.passcode || '');
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleUpdateMessage = async () => {
    setIsUpdating(true);
    const updateData: { reaction_length?: number; passcode?: string | null } = {};

    const currentReactionLength = normalizedMessage.reaction_length || 10;
    if (reactionLengthInput !== currentReactionLength) {
      updateData.reaction_length = reactionLengthInput;
    }

    const currentPasscode = normalizedMessage.passcode || '';
    if (passcodeInput !== currentPasscode) {
      updateData.passcode = passcodeInput === '' ? null : passcodeInput;
    }

    if (Object.keys(updateData).length === 0) {
      toast('No changes made');
      setIsUpdating(false);
      return;
    }

    try {
      const response = await messagesApi.updateMessageDetails(normalizedMessage.id, updateData);
      if (onMessageUpdate) {
        onMessageUpdate(response.data);
      }
      toast.success('Message updated successfully');
      handleCloseEditModal();
    } catch (error: any) {
      // Error toast is likely handled by global interceptor, but a specific one can be added here if needed.
      // toast.error(error?.response?.data?.message || 'Failed to update message.');
      console.error('Failed to update message:', error);
    } finally {
      setIsUpdating(false);
    }
  };

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
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Message Details</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Created on {formatDate(message.createdAt)}
          </p>
        </div>
        <Button onClick={handleOpenEditModal} variant="outline" size="sm">
          Edit Options
        </Button>
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
        <video
          ref={videoRef}
          src={normalizedMessage.videoUrl}
          controls
          autoPlay
          playsInline
          className="rounded-md mb-4 w-full"
        />
      )}

      {/* Shareable Link & Options */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Shareable Link</p>
          {/* Placeholder for any other general options if needed */}
        </div>
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
              toast.success('Link copied to clipboard'); // Using toast for consistency
            }}
          >
            Copy
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowQrCode(!showQrCode)}
          >
            {showQrCode ? 'Hide QR Code' : 'Show QR Code'}
          </Button>
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

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Edit Message Options"
        footer={
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCloseEditModal} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMessage} isLoading={isUpdating} disabled={isUpdating}>
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="reactionLength" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Reaction Length (10-30 seconds)
            </label>
            <Input
              type="number"
              id="reactionLength"
              value={reactionLengthInput.toString()}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                // Clamp value between 10 and 30, or allow empty for typing
                if (isNaN(val) || (val >= 10 && val <=30)) {
                   setReactionLengthInput(isNaN(val) ? 10 : val); // Default to 10 if NaN (e.g. empty input)
                } else if (val < 10) {
                  setReactionLengthInput(10);
                } else if (val > 30) {
                  setReactionLengthInput(30);
                }
              }}
              min="10"
              max="30"
              className="w-full dark:bg-neutral-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="passcode" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Passcode (leave empty to remove)
            </label>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                id="passcode"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter new passcode"
                className="w-full dark:bg-neutral-700 dark:text-white"
              />
              {passcodeInput && (
                <Button variant="ghost" size="sm" onClick={() => setPasscodeInput('')}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MessageDetails;
