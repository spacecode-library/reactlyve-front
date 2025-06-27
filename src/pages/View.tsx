import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MESSAGE_ERRORS } from '../components/constants/errorMessages';
import PasscodeEntry from '../components/recipient/PasscodeEntry';
import MessageViewer from '../components/recipient/MessageViewer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api, { repliesApi } from '../services/api';
import { normalizeMessage } from '../utils/normalizeKeys';
import { Message as MessageData } from '../types/message';

const View: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [message, setMessage] = useState<MessageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsPasscode, setNeedsPasscode] = useState(false);
  const [passcodeVerified, setPasscodeVerified] = useState(false);

  // ⏲️ Track reaction session ID statefully
  const reactionIdRef = useRef<string | null>(null);
  const sessionStartTimeRef = useRef<number>(Date.now());

  const handleInitReactionId = (id: string) => {
    reactionIdRef.current = id;
    sessionStartTimeRef.current = Date.now();
  };

  useEffect(() => {
    const fetchMessage = async () => {
      if (!id) {
        setError('Invalid message link');
        setLoading(false);
        return;
      }

      setError(null);

      try {
        const response = await api.get(`/messages/view/${id}`);
        if (response.data.onetime && response.data.linkViewed) {
          setError(MESSAGE_ERRORS.LINK_EXPIRED);
          return;
        }
        const messageId = response.data.id;
        const rawMessageData = (await api.get(`/messages/${messageId}`)).data;
        const messageData = normalizeMessage(rawMessageData);
        if (response.data.onetime !== undefined) {
          messageData.onetime = response.data.onetime;
        }
        if (response.data.linkViewed !== undefined) {
          messageData.linkViewed = response.data.linkViewed;
        }

        const requiresPasscode = response.data.hasPasscode === true;
        const isVerified = response.data.passcodeVerified === true || !requiresPasscode;

        setMessage(messageData);
        setNeedsPasscode(requiresPasscode && !isVerified);
        setPasscodeVerified(isVerified);
      } catch (err) {
        console.error('Error fetching message:', err);
        setError(MESSAGE_ERRORS.NOT_FOUND);
      } finally {
        setLoading(false);
        // window.scrollTo(0, 0); // Removed as per new strategy
      }
    };

    fetchMessage();
  }, [id]);

  // Scroll to top when message is loaded
  useEffect(() => {
    if (message) {
      window.scrollTo(0, 0);
    }
  }, [message]);

  const handleSubmitPasscode = async (passcode: string): Promise<boolean> => {
    if (!id || !message) return false;

    try {
      setError(null);
      const verify = await api.post(`/messages/${id}/verify-passcode`, { passcode });

      const updatedView = await api.get(`/messages/view/${id}`);
      if (updatedView.data.onetime && updatedView.data.linkViewed) {
        setError(MESSAGE_ERRORS.LINK_EXPIRED);
        return false;
      }
      const updatedMsgRaw = await api.get(`/messages/${updatedView.data.id}`);

      if (verify.data?.verified || verify.status === 200) {
        setError(null);
        setPasscodeVerified(true);
        if (updatedMsgRaw.data) {
          const m = normalizeMessage(updatedMsgRaw.data);
          if (updatedView.data.onetime !== undefined) {
            m.onetime = updatedView.data.onetime;
          }
          if (updatedView.data.linkViewed !== undefined) {
            m.linkViewed = updatedView.data.linkViewed;
          }
          setMessage(m);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error verifying passcode:', err);
      return false;
    }
  };

  const handleRecordReaction = async (): Promise<void> => {
    toast.success('Your reaction has been recorded');
  };

  const handleSendTextReply = async (_messageId: string, text: string): Promise<void> => {
    const currentReactionId = reactionIdRef.current;

    if (!currentReactionId) {
      toast.error('Reply channel not ready yet. Please wait a moment and try again');
      return;
    }

    try {
      await repliesApi.sendText(currentReactionId, text);
      toast.success('Your reply has been sent');
    } catch (error) {
      console.error('Error uploading reply:', error);
      toast.error('Failed to upload reply. Please try again');
    }
  };

  const renderErrorCard = (title: string, messageText?: string) => (
    <div data-theme-target className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-neutral-50 px-4 py-2 dark:bg-neutral-900 sm:py-6">
      <div className="card mx-auto max-w-md p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white text-center">{title}</h3>
        {messageText && (
          <div className="mt-4 rounded-md bg-blue-50 p-4 text-center dark:bg-blue-900/30">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 text-center">{messageText}</p>
          </div>
        )}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div data-theme-target className="flex min-h-[100dvh] flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-neutral-600 dark:text-neutral-300">Loading message...</p>
      </div>
    );
  }

  if (error) {
    const title =
      error === MESSAGE_ERRORS.NOT_FOUND
        ? 'Message Not Found'
        : error === MESSAGE_ERRORS.LINK_EXPIRED
          ? 'Link Expired'
          : 'Error';
    return renderErrorCard(title, error);
  }

  if (needsPasscode && !passcodeVerified) {
    return (
      <div data-theme-target className="flex min-h-[100dvh] items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
        <div className="w-full max-w-md mx-auto">
          <PasscodeEntry onSubmitPasscode={handleSubmitPasscode} />
        </div>
      </div>
    );
  }

  if (message && (passcodeVerified || !needsPasscode)) {
    return (
      <div data-theme-target className="flex min-h-[100dvh] items-center justify-start bg-neutral-50 px-4 py-8 dark:bg-neutral-900 sm:py-12">
        <MessageViewer
          message={message}
          onRecordReaction={async () => {}} // Changed to an async no-op function
          onLocalRecordingComplete={() => {
            handleRecordReaction();
          }}
          onSubmitPasscode={handleSubmitPasscode}
          onSendTextReply={handleSendTextReply}
          onInitReactionId={handleInitReactionId}
          linkId={id}
        />
      </div>
    );
  }

  return (
    renderErrorCard('Error', 'Something went wrong. Please try again later.')
  );
};

export default View;
