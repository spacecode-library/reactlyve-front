import React, { useState, useEffect } from 'react';
import WebcamRecorder from './WebcamRecorder';
import PermissionRequest from './PermissionRequest';
import PasscodeEntry from './PasscodeEntry';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Message } from '../../types/message';
import { normalizeMessage } from '../../utils/normalizeKeys';
import { reactionsApi, repliesApi } from '../../services/api';
import { v4 as uuidv4 } from 'uuid';

interface MessageViewerProps {
  message: Message;
  onRecordReaction: (messageId: string, videoBlob: Blob) => Promise<void>;
  onRecordReply?: (messageId: string, videoBlob: Blob) => Promise<void>;
  onSkipReaction?: () => void;
  onSubmitPasscode: (passcode: string) => Promise<boolean>;
  onSendTextReply?: (messageId: string, text: string) => Promise<void>;
  onInitReactionId?: (id: string) => void;
}

const MessageViewer: React.FC<MessageViewerProps> = ({
  message,
  onRecordReaction,
  onRecordReply,
  onSkipReaction,
  onSubmitPasscode,
  onSendTextReply,
  onInitReactionId,
}) => {
  const normalizedMessage = normalizeMessage(message);
  const [reactionId, setReactionId] = useState<string | null>(null);
  const [showRecorder, setShowRecorder] = useState<boolean>(!normalizedMessage.videoUrl);
  const [isReactionRecorded, setIsReactionRecorded] = useState<boolean>(!!normalizedMessage.videoUrl);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [passcodeVerified, setPasscodeVerified] = useState<boolean>(message.passcodeVerified || !message.hasPasscode);
  const [countdownComplete, setCountdownComplete] = useState<boolean>(!!normalizedMessage.videoUrl);
  const [replyText, setReplyText] = useState<string>('');
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const navigate = useNavigate();

  const formattedDate = message.createdAt
    ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })
    : '';

    // Always reset session when the component mounts
  useEffect(() => {
      localStorage.removeItem(`reaction-session-${message.id}`);
    }, [message.id]);
  
  const [sessionId] = useState(() => {
    // Reuse if already stored for this message in localStorage
    const key = `reaction-session-${message.id}`;
    const stored = localStorage.getItem(key);
    if (stored) return stored;
  
    // Otherwise generate and save
    const newSession = uuidv4();
    localStorage.setItem(key, newSession);
    return newSession;
  });

  console.log("Sending sessionId:", sessionId, "for message:", message.id);
  
  // Init reaction ID early
  useEffect(() => {
    reactionsApi
      .getByMessageId(message.id)
      .then((res) => {
        const allReactions = res.data;
        if (allReactions.length > 0) {
          const latest = allReactions[allReactions.length - 1];
          setReactionId(latest.id);
          onInitReactionId?.(latest.id); // ✅ callback
        } else {
          return reactionsApi.init(message.id, sessionId).then((res) => {
            setReactionId(res.data.reactionId);
            onInitReactionId?.(res.data.reactionId); // ✅ callback
          });
        }
      })
      .catch((err) => console.error('❌ Failed to load or init reaction:', err));
  }, [message.id]);

  useEffect(() => {
    if (normalizedMessage.videoUrl) {
      setIsReactionRecorded(true);
      setShowRecorder(false);
      setCountdownComplete(true);
    }
  }, [normalizedMessage.videoUrl]);

  const handleReactionComplete = async (blob: Blob) => {
    try {
      if (!reactionId) throw new Error('Missing reaction ID');
      await reactionsApi.uploadVideoToReaction(reactionId, blob);
      await onRecordReaction(message.id, blob); // still call external handler
      setIsReactionRecorded(true);
      setShowRecorder(false);
    } catch (error) {
      console.error('Reaction save error:', error);
      setPermissionError('An error occurred while saving your reaction. Please check your connection and try again.');
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
    const text = replyText.trim();
    if (!text) return;
  
    setIsSendingReply(true);
    setReplyError(null);
  
    try {
      let activeReactionId = reactionId;
  
      // ✅ Ensure reaction exists before sending reply
      if (!activeReactionId) {
        const res = await reactionsApi.init(message.id, sessionId);
        activeReactionId = res.data.reactionId;
        setReactionId(activeReactionId);
        onInitReactionId?.(activeReactionId);
      }
  
      await repliesApi.sendText(activeReactionId, text);
      setReplyText('');
    } catch (error) {
      console.error('Reply error:', error);
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
      {normalizedMessage.mediaType === 'image' && normalizedMessage.imageUrl && (
        <div className="mt-4 overflow-hidden rounded-lg">
          <img src={normalizedMessage.imageUrl} alt="Message attachment" className="w-full object-cover" />
        </div>
      )}
      {normalizedMessage.mediaType === 'video' && normalizedMessage.videoUrl && (
        <div className="mt-4 overflow-hidden rounded-lg">
          <video src={normalizedMessage.videoUrl} controls className="w-full object-cover" />
        </div>
      )}

      {/* Reaction Preview */}
      {normalizedMessage.videoUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-2">Reaction</h3>
          <video controls src={normalizedMessage.videoUrl} className="w-full rounded-lg" />
          <div className="mt-2 text-right">
            <a
              href={normalizedMessage.videoUrl}
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
          disabled={!replyText.trim() || isSendingReply || !reactionId}
          className={`btn btn-primary flex items-center space-x-2 ${
            (!replyText.trim() || isSendingReply || !reactionId) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span>{isSendingReply ? 'Sending...' : 'Send Reply'}</span>
        </button>
        </div>
        {!reactionId && (
          <p className="text-sm text-yellow-600 mt-2">
            Preparing reply channel... please wait a moment.
          </p>
        )}
        {replyError && <p className="text-sm text-red-600 mt-2">{replyError}</p>}
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          {replyText.length}/500 characters
        </p>

        {isReactionRecorded && !normalizedMessage.videoUrl && (
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
          hidePreviewAfterCountdown={true}
        />
      )}
      {countdownComplete && renderMessageContent()}
    </div>
  );
};

export default MessageViewer;
