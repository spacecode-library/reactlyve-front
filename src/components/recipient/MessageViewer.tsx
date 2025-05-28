import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import WebcamRecorder from './WebcamRecorder';
import PermissionRequest from './PermissionRequest';
import PasscodeEntry from './PasscodeEntry';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '../../types/message';
import { normalizeMessage } from '../../utils/normalizeKeys';
import { reactionsApi, repliesApi } from '../../services/api';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import VideoPlayer from '../dashboard/VideoPlayer'; // Added VideoPlayer import

interface MessageViewerProps {
  message: Message;
  onRecordReaction: (messageId: string, videoBlob: Blob) => Promise<void>;
  onRecordReply?: (messageId: string, videoBlob: Blob) => Promise<void>;
  onSkipReaction?: () => void;
  onSubmitPasscode: (passcode: string) => Promise<boolean>;
  onSendTextReply?: (messageId: string, text: string) => Promise<void>;
  onInitReactionId?: (id: string) => void;
  onLocalRecordingComplete?: () => void; 
}

const MessageViewer: React.FC<MessageViewerProps> = ({
  message,
  onRecordReaction,
  onRecordReply,
  onSkipReaction,
  onSubmitPasscode,
  onSendTextReply,
  onInitReactionId,
  onLocalRecordingComplete,
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
  const [isUploading, setIsUploading] = useState(false); 
  // Removed: const videoRef = useRef<HTMLVideoElement>(null);

  const formattedDate = message.createdAt
    ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })
    : '';

  const [sessionId] = useState(() => {
    const id = uuidv4();
    sessionStorage.setItem(`reaction-session-${message.id}`, JSON.stringify({ id, createdAt: Date.now() }));
    return id;
  });

  // Removed useEffect for videoRef.current.play()

  const handleReactionComplete = async (blob: Blob) => {
    setIsUploading(true); 
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
    } finally {
      setIsUploading(false); 
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
      setPermissionError("Please enter your name to start the reaction.");
      return;
    }
    try {
      const currentSessionId = String(sessionId); // Ensure it's a string
      // The console log should use currentSessionId too
      console.log('Attempting to initialize reaction. Parameters:', {
        messageId: message.id,
        sessionId: currentSessionId,
        name: recipientName || undefined
      });
      const res = await reactionsApi.init(message.id, currentSessionId, recipientName || undefined);
      if (res.data.reactionId) {
        setReactionId(res.data.reactionId);
        onInitReactionId?.(res.data.reactionId); 
        setIsNameSubmitted(true);
        setPermissionError(null); 
        setTriggerCountdown(true);
      } else {
        throw new Error("Reaction ID not received.");
      }
    } catch (err) {
      console.error('❌ Failed to initialize reaction:', err);
      let errorMessage = 'Unable to start a reaction session. Please refresh and try again.';
      if (err instanceof Error && err.message && (err.message.includes('session') || err.message.includes('name'))) {
          errorMessage = err.message;
      }
      setPermissionError(errorMessage);
      toast.error(errorMessage); 
      setIsNameSubmitted(false); 
      setTriggerCountdown(false); 
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
          <VideoPlayer
            src={normalizedMessage.videoUrl}
            poster={normalizedMessage.thumbnailUrl || undefined}
            className="w-full object-cover"
            autoPlay={countdownComplete}
          />
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
      {isReactionRecorded && (
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            Get reactions to your own messages by{' '}
            <Link to="/" className="font-semibold text-primary-600 hover:text-primary-700 dark:hover:text-primary-500 underline">
              signing up here
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div
        className={"flex min-h-screen w-full flex-col items-center justify-center bg-neutral-50 px-4 py-8 dark:bg-neutral-900 sm:py-12"}
      >
        {showRecorder && !isReactionRecorded && ( 
          <div className="w-full max-w-md mx-auto mb-4">
            <WebcamRecorder
              onRecordingComplete={handleReactionComplete}
              onCancel={() => { /* Consider what cancel means in this new flow */ }}
              maxDuration={15000}
              countdownDuration={5} 
              onPermissionDenied={(err) => setPermissionError(err)}
              autoStart={false} 
              triggerCountdownSignal={triggerCountdown} 
              onCountdownComplete={handleCountdownComplete} 
              hidePreviewAfterCountdown={true}
              onStatusUpdate={setWebcamStatusMessage} 
              onWebcamError={setWebcamInlineError}   
              isUploading={isUploading} // This line was duplicated in the error
              hideUploadSpinner={isUploading} 
            />
          </div>
        )}
        {showRecorder && !isNameSubmitted && ( 
          <div className="mb-4 w-full max-w-md mx-auto">
            <label htmlFor="recipientName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 text-center">
              Say hello with your name
            </label>
            <input
              type="text"
              id="recipientName"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-2 border border-neutral-300 rounded-md dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              disabled={isNameSubmitted} 
            />
            <button
              onClick={handleStartReaction} 
              disabled={!recipientName.trim() || isNameSubmitted}
              className="btn btn-primary w-full mt-2" 
            >
              Start Reaction
            </button>
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 text-center">
              By continuing, you are accepting the{' '}
              <Link to="/terms" className="underline hover:text-primary-600">
                Terms and Conditions
              </Link>
              ,{' '}
              <Link to="/privacy" className="underline hover:text-primary-600">
                Privacy Policy
              </Link>
              , and{' '}
              <Link to="/cookie-policy" className="underline hover:text-primary-600">
                Cookie Policy
              </Link>
              .
            </p>
            {!permissionError && webcamStatusMessage && (
              <p className="text-sm text-gray-500 mt-2 text-center">{webcamStatusMessage}</p>
            )}
            {!permissionError && webcamInlineError && (
              <p className="text-sm text-red-600 mt-2 text-center">{webcamInlineError}</p>
            )}
          </div>
        )}
        {countdownComplete && renderMessageContent()}
      </div>
      {isUploading && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
          <div className="h-16 w-16 animate-spin rounded-full border-8 border-neutral-300 border-t-primary-600 mb-4"></div>
          <p className="text-white text-xl font-semibold">Uploading Reaction...</p>
          <p className="text-neutral-200 text-md">Please wait a moment.</p>
        </div>
      )}
    </>
  );
};

export default MessageViewer;
