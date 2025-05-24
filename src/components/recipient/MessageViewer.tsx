import React, { useState, useEffect, useRef } from 'react';
import WebcamRecorder from './WebcamRecorder';
import PermissionRequest from './PermissionRequest';
import PasscodeEntry from './PasscodeEntry';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '../../types/message';
import { normalizeMessage } from '../../utils/normalizeKeys';
import { reactionsApi, repliesApi } from '../../services/api';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface MessageViewerProps {
  message: Message;
  onRecordReaction: (messageId: string, videoBlob: Blob) => Promise<void>;
  onRecordReply?: (messageId: string, videoBlob: Blob) => Promise<void>;
  onSkipReaction?: () => void;
  onSubmitPasscode: (passcode: string) => Promise<boolean>;
  onSendTextReply?: (messageId: string, text: string) => Promise<void>;
  onInitReactionId?: (id: string) => void;
  onLocalRecordingComplete?: () => void; // Add this line
}

const MessageViewer: React.FC<MessageViewerProps> = ({
  message,
  onRecordReaction,
  onRecordReply,
  onSkipReaction,
  onSubmitPasscode,
  onSendTextReply,
  onInitReactionId,
  onLocalRecordingComplete, // Add this
}) => {
  const normalizedMessage = normalizeMessage(message);
  const [reactionId, setReactionId] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState<string>('');
  const [isNameSubmitted, setIsNameSubmitted] = useState(false);
  const [triggerCountdown, setTriggerCountdown] = useState(false);
  const [webcamStatusMessage, setWebcamStatusMessage] = useState<string | null>(null);
  const [webcamInlineError, setWebcamInlineError] = useState<string | null>(null);
  const [showRecorder, setShowRecorder] = useState(true);
  const [isReactionRecorded, setIsReactionRecorded] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [passcodeVerified, setPasscodeVerified] = useState(message.passcodeVerified || !message.hasPasscode);
  const [countdownComplete, setCountdownComplete] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false); // New state
  const videoRef = useRef<HTMLVideoElement>(null);

  const formattedDate = message.createdAt
    ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })
    : '';

  const [sessionId] = useState(() => {
    const id = uuidv4();
    sessionStorage.setItem(`reaction-session-${message.id}`, JSON.stringify({ id, createdAt: Date.now() }));
    return id;
  });

  useEffect(() => {
    // Only attempt to play if the message content (which includes the video) is supposed to be visible.
    // This depends on the `countdownComplete` state in this specific component.
    if (videoRef.current && countdownComplete) {
      videoRef.current.play().catch(error => {
        console.warn("Unmuted autoplay was prevented by the browser:", error);
        // Browser prevented unmuted autoplay.
        // Controls are visible, so user can manually play.
      });
    }
  }, [normalizedMessage.videoUrl, countdownComplete]); // Re-run if videoUrl or countdownComplete changes

  const handleReactionComplete = async (blob: Blob) => {
    setIsUploading(true); // Set true before try
    try {
      if (!reactionId) throw new Error('Missing reaction ID');
      onLocalRecordingComplete?.();
      await reactionsApi.uploadVideoToReaction(reactionId, blob);
      await onRecordReaction(message.id, blob);
      setIsReactionRecorded(true);
      setShowRecorder(false);
      toast.success('Reaction uploaded successfully!');
    } catch (error) {
      console.error('Reaction save error:', error);
      setPermissionError('An error occurred while saving your reaction. Please try again.');
      // Consider if setIsReactionRecorded(false) or other state resets are needed on error
    } finally {
      setIsUploading(false); // Set false in finally
    }
  };

  const handleSendReply = async () => {
    const text = replyText.trim();
    if (!text || !reactionId) return;
    setIsSendingReply(true);
    setReplyError(null);

    try {
      await repliesApi.sendText(reactionId, text);
      setReplyText('');
      toast.success('Reply sent successfully!');
    } catch (error) {
      console.error('Reply error:', error);
      setReplyError('Failed to send reply. Please try again.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handlePasscodeSubmit = async (passcode: string) => {
    const valid = await onSubmitPasscode(passcode);
    if (valid) setPasscodeVerified(true);
    return valid;
  };

  const handleStartReaction = async () => {
    if (!recipientName.trim()) {
      // Optionally, show a toast or inline message if name is required,
      // though the button is disabled. This is a fallback.
      setPermissionError("Please enter your name to start the reaction.");
      return;
    }
    try {
      const res = await reactionsApi.init(message.id, sessionId, recipientName || undefined);
      if (res.data.reactionId) {
        setReactionId(res.data.reactionId);
        onInitReactionId?.(res.data.reactionId); // Call existing prop if needed
        setIsNameSubmitted(true);
        setPermissionError(null); // Clear any previous errors
        setTriggerCountdown(true);
      } else {
        throw new Error("Reaction ID not received.");
      }
    } catch (err) {
      console.error('❌ Failed to initialize reaction:', err);
      let errorMessage = 'Unable to start a reaction session. Please refresh and try again.';
      // Note: Checking for err.response.data.error for AxiosError requires 'axios' import
      // and type guard, which might be overly complex for this direct edit.
      // Sticking to a simpler error message extraction for now.
      if (err instanceof Error && err.message && (err.message.includes('session') || err.message.includes('name'))) {
          errorMessage = err.message;
      }
      setPermissionError(errorMessage);
      toast.error(errorMessage); // Also show a toast
      setIsNameSubmitted(false); // Keep UI in name input state
      setTriggerCountdown(false); // Add this in the catch block
    }
  };

  const handleCountdownComplete = () => {
    setCountdownComplete(true);
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
      {message.sender && (
        <div className="mb-4 flex items-center">
          <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
            {message.sender.picture ? (
              <img src={message.sender.picture} alt={message.sender.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-primary-600 text-white">
                {message.sender.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="font-medium text-neutral-900 dark:text-white">{message.sender.name}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{formattedDate}</p>
          </div>
        </div>
      )}

      <div className="prose prose-neutral dark:prose-invert">
        <p className="whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">{message.content}</p>
      </div>

      {normalizedMessage.mediaType === 'image' && normalizedMessage.imageUrl && (
        <div className="mt-4 rounded-lg overflow-hidden">
          <img src={normalizedMessage.imageUrl} alt="Message attachment" className="w-full object-cover" />
        </div>
      )}

      {normalizedMessage.mediaType === 'video' && normalizedMessage.videoUrl && (
        <div className="mt-4 rounded-lg overflow-hidden">
          <video ref={videoRef} src={normalizedMessage.videoUrl} controls autoPlay playsInline className="w-full object-cover" />
        </div>
      )}

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
            className="flex-1 p-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            rows={3}
            maxLength={500}
            disabled={isSendingReply}
          />
          <button
            onClick={handleSendReply}
            disabled={!replyText.trim() || isSendingReply || !reactionId}
            className={`btn btn-primary ${(!replyText.trim() || isSendingReply || !reactionId) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSendingReply ? 'Sending...' : 'Send Reply'}
          </button>
        </div>
        {replyError && <p className="text-sm text-red-600 mt-2">{replyError}</p>}
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          {replyText.length}/500 characters
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-start sm:justify-center bg-neutral-50 px-4 pt-16 pb-8 sm:py-8 dark:bg-neutral-900">
      {showRecorder && !isReactionRecorded && ( // WebcamRecorder comes first
        <div className="w-full max-w-md mx-auto mb-4">
          <WebcamRecorder
            onRecordingComplete={handleReactionComplete}
            onCancel={() => { /* Consider what cancel means in this new flow */ }}
          maxDuration={15000}
          countdownDuration={5} // This might be manually controlled now
          onPermissionDenied={(err) => setPermissionError(err)}
          autoStart={false} // Explicitly set to false
          triggerCountdownSignal={triggerCountdown} // New prop
          onCountdownComplete={handleCountdownComplete} // This prop might need to change if countdown is managed outside
          hidePreviewAfterCountdown={true}
          onStatusUpdate={setWebcamStatusMessage} // New prop
          onWebcamError={setWebcamInlineError}   // New prop
          isUploading={isUploading} // Pass the state here
          // The WebcamRecorder might need a new prop to trigger its countdown if it's not auto-starting
        />
        </div>
      )}
      {showRecorder && !isNameSubmitted && ( // Name Input Section comes after
        <div className="mb-4 w-full max-w-md mx-auto">
          <label htmlFor="recipientName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Say hello with your name
          </label>
          <input
            type="text"
            id="recipientName"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-2 border border-neutral-300 rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            disabled={isNameSubmitted} // Disable if name is submitted
          />
          <button
            onClick={handleStartReaction} // Assign the new handler
            disabled={!recipientName.trim() || isNameSubmitted}
            className="btn btn-primary w-full mt-2" // Full width, adjust as needed
          >
            Start Reaction
          </button>
          {!permissionError && webcamStatusMessage && (
            <p className="text-sm text-gray-500 mt-2">{webcamStatusMessage}</p>
          )}
          {!permissionError && webcamInlineError && (
            <p className="text-sm text-red-600 mt-2">{webcamInlineError}</p>
          )}
        </div>
      )}
      {countdownComplete && renderMessageContent()}
    </div>
  );
};

export default MessageViewer;
