import React, { useState, useEffect } from 'react';
import WebcamRecorder from './WebcamRecorder';
import PermissionRequest from './PermissionRequest';
import PasscodeEntry from './PasscodeEntry';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Message } from '../../types/message';

interface MessageViewerProps {
  message: Message;
  onRecordReaction: (messageId: string, videoBlob: Blob) => Promise<void>;
  onRecordReply?: (messageId: string, videoBlob: Blob) => Promise<void>;
  onSkipReaction?: () => void;
  onSubmitPasscode: (passcode: string) => Promise<boolean>;
  onSendTextReply?: (messageId: string, text: string) => Promise<void>;
}

const MessageViewer: React.FC<MessageViewerProps> = ({
  message,
  onRecordReaction,
  onSkipReaction,
  onSubmitPasscode,
  onSendTextReply,
}) => {
  const [showRecorder, setShowRecorder] = useState<boolean>(!message.videoUrl);
  const [isReactionRecorded, setIsReactionRecorded] = useState<boolean>(!!message.videoUrl);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [passcodeVerified, setPasscodeVerified] = useState<boolean>(message.passcodeVerified || !message.hasPasscode);
  const [countdownComplete, setCountdownComplete] = useState<boolean>(!!message.videoUrl);
  const [replyText, setReplyText] = useState<string>('');
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const navigate = useNavigate();

  const formattedDate = message.createdAt
    ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })
    : '';

  useEffect(() => {
    if (message.videoUrl) {
      setIsReactionRecorded(true);
      setShowRecorder(false);
      setCountdownComplete(true);
    }
  }, [message.videoUrl]);

  const handleReactionComplete = async (blob: Blob) => {
    try {
      await onRecordReaction(message.id, blob);
      setIsReactionRecorded(true);
      setShowRecorder(false);
    } catch (error) {
      console.error('Error saving reaction:', error);
      setPermissionError('Failed to save reaction. Please try again.');
    }
  };

  const handlePermissionDenied = (error: string) => {
    setPermissionError(error);
  };

  const handlePasscodeSubmit = async (passcode: string) => {
    const isValid = await onSubmitPasscode(passcode);
    if (isValid) setPasscodeVerified(true);
    return isValid;
  };

  const handleCountdownComplete = () => {
    setTimeout(() => {
      setCountdownComplete(true);
    }, 0);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !onSendTextReply) return;
    setIsSendingReply(true);
    setReplyError(null);
    try {
      await onSendTextReply(message.id, replyText.trim());
      setReplyText('');
    } catch (error) {
      setReplyError('Failed to send reply. Please check your connection and try again.');
    } finally {
      setIsSendingReply(false);
    }
  };

  if (!passcodeVerified && message.hasPasscode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
        <PasscodeEntry onSubmitPasscode={handlePasscodeSubmit} />
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
        <PermissionRequest
          onCancel={() => onSkipReaction?.()}
          permissionType="both"
          errorMessage={permissionError}
        />
      </div>
    );
  }

  const renderMessageContent = () => (
    <div className="card w-full max-w-2xl mx-auto animate-slide-up">
      {/* Sender Info */}
      {message.sender && (
        <div className="mb-4 flex items-center">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            {message.sender.picture ? (
              <img src={message.sender.picture} alt={message.sender.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary-600 text-white">
                {message.sender.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="font-medium text-neutral-900 dark:text-white">{message.sender.name}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{formattedDate}</p>
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className="prose prose-neutral dark:prose-invert">
        <p className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
          {message.content}
        </p>
      </div>

      {/* Media */}
      {message.mediatype === 'image' && message.imageUrl && (
        <div className="mt-4 overflow-hidden rounded-lg">
          <img src={message.imageUrl} alt="Message attachment" className="w-full object-cover" />
        </div>
      )}
      {message.mediatype === 'video' && message.imageUrl && (
        <div className="mt-4 overflow-hidden rounded-lg">
          <video src={message.imageUrl} controls className="w-full object-cover" />
        </div>
      )}

      {/* Reaction video preview */}
      {message.videoUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-2">Reaction</h3>
          <video controls src={message.videoUrl} className="w-full rounded-lg" />
          <div className="mt-2 text-right">
            <a
              href={message.videoUrl}
              download={`reaction-${message.id}.mp4`}
              className="text-primary-600 hover:underline dark:text-primary-400"
            >
              Download Reaction
            </a>
          </div>
        </div>
      )}

      {/* Reply */}
      <div className="mt-6">
        <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
          Reply to {message.sender?.name || 'the sender'}
        </h3>
        <p className="mb-4 text-neutral-600 dark:text-neutral-300">
          Share your thoughts or say thanks—your reply means a lot!
        </p>
        <div className="flex items-center space-x-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Let ${message.sender?.name || 'them'} know what you think!`}
            className="flex-1 p-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={3}
            maxLength={500}
            disabled={isSendingReply}
          />
          <button
            onClick={handleSendReply}
            disabled={!replyText.trim() || isSendingReply}
            className={`btn btn-primary flex items-center space-x-2 ${!replyText.trim() || isSendingReply ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span>{isSendingReply ? 'Sending...' : 'Send Reply'}</span>
          </button>
        </div>
        {replyError && <p className="text-sm text-red-600 mt-2">{replyError}</p>}
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          {replyText.length}/500 characters
        </p>

        {message.replies && message.replies.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-2">Previous Replies</h3>
            <ul className="space-y-3">
              {message.replies.map((reply) => (
                <li key={reply.id} className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-md shadow-sm">
                  <p className="text-sm text-neutral-900 dark:text-white">{reply.text}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {reply.createdAt && !isNaN(new Date(reply.createdAt).getTime())
                      ? new Date(reply.createdAt).toLocaleString()
                      : 'Unknown'}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
        {isReactionRecorded && !message.videoUrl && (
          <div className="mt-6">
            <h3 className="mb-2 text-xl font-semibold text-green-600 dark:text-green-400">
              Thank You!
            </h3>
            <p className="mb-4 text-neutral-600 dark:text-neutral-300">
              Your reaction video has been successfully uploaded.
            </p>
            <button
              onClick={() => {
                navigate('/');
              }}
              className="btn btn-outline"
            >
              Done
            </button>
          </div>
        )}        
      </div>
    </div>
  );
  

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-8 dark:bg-neutral-900">
      {showRecorder && (
        <WebcamRecorder
          onRecordingComplete={handleReactionComplete}
          onCancel={() => {}}
          maxDuration={15000}
          countdownDuration={5}
          onPermissionDenied={handlePermissionDenied}
          autoStart={true}
          onCountdownComplete={handleCountdownComplete}
        />
      )}
      {countdownComplete && renderMessageContent()}
    </div>
  );
};

export default MessageViewer;
