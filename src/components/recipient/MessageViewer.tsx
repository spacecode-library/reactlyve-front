import React, { useState } from 'react';
import WebcamRecorder from './WebcamRecorder';
import PermissionRequest from './PermissionRequest';
import PasscodeEntry from './PasscodeEntry';
import { formatDistanceToNow } from 'date-fns';

interface MessageData {
  id: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
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
  onSkipReaction?: () => void;
  onSubmitPasscode: (passcode: string) => Promise<boolean>;
}

const MessageViewer: React.FC<MessageViewerProps> = ({
  message,
  onRecordReaction,
  onRecordReply,
  onSkipReaction,
  onSubmitPasscode,
}) => {
  const [showRecorder, setShowRecorder] = useState<boolean>(true);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [isReactionRecorded, setIsReactionRecorded] = useState<boolean>(false);
  const [showReplyRecorder, setShowReplyRecorder] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [passcodeVerified, setPasscodeVerified] = useState<boolean>(message.passcodeVerified || !message.hasPasscode);

  const formattedDate = message.createdAt
    ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })
    : '';

  // Handle reaction recording completion
  const handleReactionComplete = async (blob: Blob) => {
    try {
      await onRecordReaction(message.id, blob);
      setIsReactionRecorded(true);
      setShowRecorder(false);
      setShowMessage(true);
    } catch (error) {
      console.error('Error saving reaction:', error);
      setPermissionError('Failed to save reaction. Please try again.');
    }
  };

  // Handle reply recording completion
  const handleReplyComplete = async (blob: Blob) => {
    if (onRecordReply) {
      try {
        await onRecordReply(message.id, blob);
        setShowReplyRecorder(false);
      } catch (error) {
        console.error('Error saving reply:', error);
        setPermissionError('Failed to save reply. Please try again.');
      }
    }
  };

  // Handle permission denial
  const handlePermissionDenied = (error: string) => {
    setPermissionError(error);
  };

  // Handle passcode submission
  const handlePasscodeSubmit = async (passcode: string) => {
    const isValid = await onSubmitPasscode(passcode);
    if (isValid) {
      setPasscodeVerified(true);
    }
    return isValid;
  };

  // Render passcode entry if required
  if (!passcodeVerified && message.hasPasscode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
        <PasscodeEntry onSubmitPasscode={handlePasscodeSubmit} />
      </div>
    );
  }

  // Render permission error
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

  // Render message content
  const renderMessageContent = () => {
    return (
      <div className="card mx-auto mb-6 w-full max-w-2xl animate-slide-up">
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
        {message.imageUrl && (
          <div className="mt-4 overflow-hidden rounded-lg">
            <img
              src={message.imageUrl}
              alt="Message attachment"
              className="w-full object-cover"
            />
          </div>
        )}
        {message.videoUrl && (
          <div className="mt-4 overflow-hidden rounded-lg">
            <video
              src={message.videoUrl}
              autoPlay
              controls
              className="w-full object-cover"
            />
          </div>
        )}
      </div>
    );
  };

  // Render reply section
  const renderReplySection = () => {
    if (showReplyRecorder) {
      return (
        <div className="card mx-auto w-full max-w-2xl animate-slide-up">
          <WebcamRecorder
            onRecordingComplete={handleReplyComplete}
            onCancel={() => setShowReplyRecorder(false)}
            maxDuration={180000} // 3 minutes
            countdownDuration={3}
            isReplyMode={true}
          />
        </div>
      );
    }

    return (
      <div className="card mx-auto w-full max-w-2xl animate-slide-up">
        <h3 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
          Send a Reply
        </h3>
        <p className="mb-6 text-neutral-600 dark:text-neutral-300">
          Want to send a video reply to {message.sender?.name || 'the sender'}? Record up to 3 minutes.
        </p>
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
          <button
            onClick={() => setShowReplyRecorder(true)}
            className="btn btn-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Record Reply
          </button>
          <button
            onClick={() => onSkipReaction?.()}
            className="btn btn-outline"
          >
            Skip
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-8 dark:bg-neutral-900">
      {showRecorder && (
        <WebcamRecorder
          onRecordingComplete={handleReactionComplete}
          onCancel={() => onSkipReaction?.()}
          maxDuration={30000} // 30 seconds
          countdownDuration={3}
          onPermissionDenied={handlePermissionDenied}
          autoStart={true}
          onCountdownComplete={() => setShowMessage(true)}
        />
      )}
      {showMessage && renderMessageContent()}
      {isReactionRecorded && renderReplySection()}
    </div>
  );
};

export default MessageViewer;