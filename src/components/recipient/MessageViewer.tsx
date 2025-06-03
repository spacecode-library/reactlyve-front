import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { AxiosError } from 'axios';
import { useAuth } from '../../context/AuthContext';
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
import { getTransformedCloudinaryUrl } from '../../utils/mediaHelpers';

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
  const { user } = useAuth();
  const isReactionLimitReached = !!(user &&
    user.max_reactions_per_month !== null &&
    (user.current_reactions_this_month ?? 0) >= user.max_reactions_per_month
  );

  const normalizedMessage = normalizeMessage(message);
  const [reactionId, setReactionId] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [imageRetryCount, setImageRetryCount] = useState(0);
  const [videoRetryCount, setVideoRetryCount] = useState(0);
  const MAX_RETRIES = 3;

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

  const transformedImgUrl = useMemo(() => {
    return normalizedMessage.imageUrl
      ? getTransformedCloudinaryUrl(normalizedMessage.imageUrl, normalizedMessage.fileSizeInBytes || 0) + `?retry=${imageRetryCount}`
      : '';
  }, [normalizedMessage.imageUrl, normalizedMessage.fileSizeInBytes, imageRetryCount]);

  const transformedVidUrl = useMemo(() => {
    return normalizedMessage.videoUrl
      ? getTransformedCloudinaryUrl(normalizedMessage.videoUrl, normalizedMessage.fileSizeInBytes || 0) + `?retry=${videoRetryCount}`
      : '';
  }, [normalizedMessage.videoUrl, normalizedMessage.fileSizeInBytes, videoRetryCount]);

  const [sessionId] = useState(() => {
    const id = uuidv4();
    sessionStorage.setItem(`reaction-session-${message.id}`, JSON.stringify({ id, createdAt: Date.now() }));
    return id;
  });

  // Removed useEffect for videoRef.current.play()

  const handleImageError = useCallback(() => {
    if (imageRetryCount < MAX_RETRIES) {
      setImageError(true);
    }
  }, [imageRetryCount]);

  const retryImageLoad = useCallback(() => {
    setImageError(false);
    setImageRetryCount(prev => prev + 1);
  }, []);

  const handleVideoError = useCallback(() => {
    if (videoRetryCount < MAX_RETRIES) {
      setVideoError(true);
    }
  }, [videoRetryCount]);

  const retryVideoLoad = useCallback(() => {
    setVideoError(false);
    setVideoRetryCount(prev => prev + 1);
  }, []);

  const handleReactionComplete = useCallback(async (blob: Blob) => {
    setIsUploading(true); 
    try {
      if (!reactionId) throw new Error('Missing reaction ID');
      onLocalRecordingComplete?.();
      // Assuming reactionsApi.uploadVideoToReaction is stable or doesn't need to be a dependency
      await reactionsApi.uploadVideoToReaction(reactionId, blob);
      await onRecordReaction(message.id, blob);
      setIsReactionRecorded(true);
      // setShowRecorder(false); // Moved to finally
      toast.success('Reaction uploaded successfully!');
    } catch (error) {
      console.error('Reaction save error:', error);
      if (error instanceof AxiosError && error.response) {
        // Assume global interceptor in api.ts handled the toast.
        // Optionally, set a generic error state if needed for UI changes beyond a toast.
        // For now, we'll just log and let the global handler show the toast.
        // If a specific UI state change is needed for API errors, set it here.
        // For example, setPermissionError('Failed to save reaction. Please check notifications.');
      } else {
        // Handle non-Axios errors or Axios errors without a response (e.g., network issues)
        setPermissionError('An error occurred while saving your reaction. Please try again.');
        toast.error('An error occurred while saving your reaction. Please try again.'); // Show toast for non-API errors
      }
    } finally {
      setIsUploading(false);
      setShowRecorder(false); // Ensure this is here
    }
  }, [reactionId, onLocalRecordingComplete, onRecordReaction, message.id]);

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
      if (err instanceof AxiosError && err.response) {
        const backendError = err.response?.data?.error;
        // TODO: Replace "SENDER_MESSAGE_REACTION_LIMIT_REACHED" with the actual error string/code from backend
        if (backendError && typeof backendError === 'string' && backendError.includes("SENDER_MESSAGE_REACTION_LIMIT_REACHED")) {
          setPermissionError("Unable to add your Reaction, please ask the sender to increase their Reaction limits");
          // Do not show a toast here, as setPermissionError will display it via PermissionRequest component
        } else {
          // Default handling for other Axios errors
          const backendErrorMessage = backendError || 'Failed to initialize reaction session.';
          setPermissionError(backendErrorMessage);
          // The global interceptor in api.ts should handle toasting for these generic backend errors.
        }
      } else {
        // Handle non-Axios errors or Axios errors without a response
        let genericMessage = 'Unable to start a reaction session. Please refresh and try again.';
        if (err instanceof Error && err.message) { // Try to get a bit more specific for non-API errors
            // Avoid showing generic Axios messages like "Request failed with status code 403"
            if (!String(err.message).toLowerCase().includes("status code")) {
                genericMessage = err.message;
            }
        }
        setPermissionError(genericMessage);
        toast.error(genericMessage); // Show toast for non-API errors
      }
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

      {(() => {
        if (normalizedMessage.mediaType === 'image' && transformedImgUrl) {
          // console.log('[MessageViewer] Image - fileSizeInBytes:', normalizedMessage.fileSizeInBytes, 'Original URL:', normalizedMessage.imageUrl, 'Transformed URL:', transformedImgUrl);
          return (
            <div className="mt-4 rounded-lg overflow-hidden">
              {imageError && imageRetryCount < MAX_RETRIES ? (
                <div className="text-center p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                  <p>Media content is not yet available.</p>
                  <button
                    onClick={retryImageLoad}
                    className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Retry
                  </button>
                </div>
              ) : imageRetryCount >= MAX_RETRIES && imageError ? (
                <div className="text-center p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  <p>Failed to load image after multiple retries.</p>
                </div>
              ) : (
                <img
                  key={imageRetryCount} // Add key to force re-render on retry
                  src={transformedImgUrl}
                  alt="Message attachment"
                  className="w-full object-cover"
                  onError={handleImageError}
                  onLoad={() => { setImageError(false); setImageRetryCount(0); }} // Reset error on successful load
                />
              )}
            </div>
          );
        }
        return null;
      })()}

      {(() => {
        if (normalizedMessage.mediaType === 'video' && transformedVidUrl) {
          // console.log('[MessageViewer] Video - fileSizeInBytes:', normalizedMessage.fileSizeInBytes, 'Original URL:', normalizedMessage.videoUrl, 'Transformed URL:', transformedVidUrl);
          return (
            <div className="mt-4 rounded-lg overflow-hidden">
              {videoError && videoRetryCount < MAX_RETRIES ? (
                <div className="text-center p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                  <p>Media content is not yet available.</p>
                  <button
                    onClick={retryVideoLoad}
                    className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Retry
                  </button>
                </div>
              ) : videoRetryCount >= MAX_RETRIES && videoError ? (
                <div className="text-center p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  <p>Failed to load video after multiple retries.</p>
                </div>
              ) : (
                <VideoPlayer
                  key={videoRetryCount} // Add key to force re-render on retry
                  src={transformedVidUrl}
                  poster={normalizedMessage.thumbnailUrl || undefined}
                  className="w-full object-cover"
                  autoPlay={countdownComplete}
                  onError={handleVideoError}
                  // Consider adding an onLoaded or similar prop to VideoPlayer to reset error state
                />
              )}
            </div>
          );
        }
        return null;
      })()}

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
              maxDuration={(normalizedMessage.reaction_length ? normalizedMessage.reaction_length * 1000 : 15000)}
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
            {isReactionLimitReached && (
              <div className="p-3 my-2 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
                You have reached your monthly reaction limit. You won't be able to react more this month.
              </div>
            )}
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
              disabled={isNameSubmitted || isReactionLimitReached} // Modify this
            />
            <button
              onClick={handleStartReaction} 
              disabled={!recipientName.trim() || isNameSubmitted || isReactionLimitReached} // Modify this
              className="btn btn-primary w-full mt-2" 
              title={isReactionLimitReached ? "You have reached your monthly reaction limit." : undefined} // Add tooltip
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
