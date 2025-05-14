import React, { useState, useEffect } from 'react';
import WebcamRecorder from './WebcamRecorder';
import PermissionRequest from './PermissionRequest';
import PasscodeEntry from './PasscodeEntry';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface MessageData {
  id: string;
  content: string;
  imageurl?: string;
  videourl?: string;
  mediatype: "image" | "video";
  hasPasscode: boolean;
  passcodeVerified?: boolean;
  viewCount?: number;
  createdAt: string;
  sender?: {
    name: string;
    picture?: string;
  };
}

interface MessageViewerProps {
  message: MessageData;
  onRecordReaction: (messageId: string, videoBlob: Blob) => Promise<void>;
  onRecordReply?: (messageId: string, videoBlob: Blob) => Promise<void>;
  onSkipReaction?: () => {href: "http://localhost:5173"};
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
  const [showRecorder, setShowRecorder] = useState<boolean>(true);
  const [isReactionRecorded, setIsReactionRecorded] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [passcodeVerified, setPasscodeVerified] = useState<boolean>(message.passcodeVerified || !message.hasPasscode);
  const [countdownComplete, setCountdownComplete] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>(''); // State for text reply
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false); // State for reply submission
  const navigate = useNavigate();
  const formattedDate = message.createdAt
    ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })
    : '';

  // Debugging: Log component lifecycle
  useEffect(() => {
    console.log('MessageViewer: Component mounted');
    return () => {
      console.log('MessageViewer: Component unmounted');
    };
  }, []);

  // Debugging: Log state changes
  useEffect(() => {
    console.log('State Update:', {
      showRecorder,
      isReactionRecorded,
      countdownComplete,
      permissionError,
    });
  }, [showRecorder, isReactionRecorded, countdownComplete, permissionError]);

  // Handle reaction recording completion
  const handleReactionComplete = async (blob: Blob) => {
    console.log('handleReactionComplete: Starting reaction upload');
    try {
      await onRecordReaction(message.id, blob); // Wait for upload to complete
      console.log('handleReactionComplete: Reaction upload successful');
      setIsReactionRecorded(true); // Only set after successful upload
      setShowRecorder(false); // Hide recorder
    } catch (error) {
      console.error('Error saving reaction:', error);
      setPermissionError('Failed to save reaction. Please try again.');
    }
  };

  // Handle permission denial
  const handlePermissionDenied = (error: string) => {
    console.log('handlePermissionDenied:', error);
    setPermissionError(error);
  };

  // Handle passcode submission
  const handlePasscodeSubmit = async (passcode: string) => {
    console.log('handlePasscodeSubmit: Submitting passcode');
    const isValid = await onSubmitPasscode(passcode);
    if (isValid) {
      console.log('handlePasscodeSubmit: Passcode verified');
      setPasscodeVerified(true);
    }
    return isValid;
  };

  // Handle countdown completion
  const handleCountdownComplete = () => {
    console.log('handleCountdownComplete: Countdown completed');
    // Defer state update to avoid React warning
    setTimeout(() => {
      setCountdownComplete(true);
    }, 0);
  };

  // Handle text reply submission
  const handleSendReply = async () => {
    if (!replyText.trim() || !onSendTextReply) return;
    setIsSendingReply(true);
    try {
      await onSendTextReply(message.id, replyText.trim());
      setReplyText(''); // Clear the input after successful submission
      console.log('Text reply sent successfully');
    } catch (error) {
      console.error('Error sending text reply:', error);
      setPermissionError('Failed to send reply. Please try again.');
    } finally {
      setIsSendingReply(false);
    }
  };

  // Render passcode entry if required
  if (!passcodeVerified && message.hasPasscode) {
    console.log('Rendering PasscodeEntry');
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
        <PasscodeEntry onSubmitPasscode={handlePasscodeSubmit} />
      </div>
    );
  }

  // Render permission error
  if (permissionError) {
    console.log('Rendering PermissionRequest due to error:', permissionError);
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
        <PermissionRequest
          onCancel={() => {
            console.log('PermissionRequest onCancel triggered');
            onSkipReaction?.();
          }}
          permissionType="both"
          errorMessage={permissionError}
        />
      </div>
    );
  }

  // Render message content with reply input
  const renderMessageContent = () => {
    console.log('renderMessageContent: Rendering message content', { isReactionRecorded, countdownComplete });
    return (
      <div className="card w-full max-w-2xl mx-auto animate-slide-up">
        {/* Sender info */}
        {message.sender && (
          <div className="mb-4 flex items-center">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              {message.sender.picture ? (
                <img
                  src={message.sender.picture}
                  alt={message.sender.name}
                  className="h-full w-full object-cover"
                />
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

        {/* Message text */}
        <div className="prose prose-neutral dark:prose-invert">
          <p className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
            {message.content}
          </p>
        </div>

        {/* Message media */}
        {message.mediatype == 'image' && (
          <div className="mt-4 overflow-hidden rounded-lg">
            <img
              src={message.imageurl}
              alt="Message attachment"
              className="w-full object-cover"
            />
          </div>
        )}
        {message.mediatype == 'video' && (
          <div className="mt-4 overflow-hidden rounded-lg">
            <video
              src={message.imageurl}
              autoPlay
              controls
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Reply Section */}
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
              {isSendingReply ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
              <span>{isSendingReply ? 'Sending...' : 'Send Reply'}</span>
            </button>
          </div>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {replyText.length}/500 characters
          </p>
        </div>

        {/* Post-reaction actions */}
        {isReactionRecorded && (
          <div className="mt-6">
            <h3 className="mb-2 text-xl font-semibold text-green-600 dark:text-green-400">
              Thank You!
            </h3>
            <p className="mb-4 text-neutral-600 dark:text-neutral-300">
              Your reaction video has been successfully uploaded.
            </p>
            <button
              onClick={() => {
                console.log('Skip button clicked');
                navigate('/')
              }}
              className="btn btn-outline"
            >
              Done
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-8 dark:bg-neutral-900">
      {showRecorder && (
        <WebcamRecorder
          onRecordingComplete={handleReactionComplete}
          onCancel={() => {}} // Empty handler since cancel button is removed
          maxDuration={30000} // 30 seconds
          countdownDuration={3}
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