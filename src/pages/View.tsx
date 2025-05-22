import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MESSAGE_ERRORS } from '../components/constants/errorMessages';
import PasscodeEntry from '../components/recipient/PasscodeEntry';
import MessageViewer from '../components/recipient/MessageViewer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api, { reactionsApi, repliesApi } from '../services/api';
import { Message as MessageData } from '../types/message';

const View: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [message, setMessage] = useState<MessageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsPasscode, setNeedsPasscode] = useState(false);
  const [passcodeVerified, setPasscodeVerified] = useState(false);

  const reactionIdRef = useRef<string | null>(null);

  const handleInitReactionId = (id: string) => {
    reactionIdRef.current = id;
    console.log('✅ Reaction ID initialised:', id);
  };

  useEffect(() => {
    const fetchMessage = async () => {
      if (!id) {
        setError('Invalid message link');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/messages/view/${id}`);
        const messageId = response.data.id;
        const responseById = await api.get(`/messages/${messageId}`);
        const messageData = responseById.data;

        if (messageData) {
          const requiresPasscode = response.data.hasPasscode === true;
          const isVerified = response.data.passcodeVerified === true || !requiresPasscode;

          setMessage(messageData);
          setNeedsPasscode(requiresPasscode && !isVerified);
          setPasscodeVerified(isVerified);
        }
      } catch (error) {
        console.error('Error fetching message:', error);
        setError(MESSAGE_ERRORS.NOT_FOUND);
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id]);

  const handleSubmitPasscode = async (passcode: string): Promise<boolean> => {
    if (!id || !message) return false;

    try {
      const response = await api.post(`/messages/${id}/verify-passcode`, { passcode });

      const responseView = await api.get(`/messages/view/${id}`);
      const responseById = await api.get(`/messages/${responseView.data.id}`);

      if (response.data && (response.data.verified || response.status === 200)) {
        setPasscodeVerified(true);
        if (responseById.data) {
          setMessage(responseById.data);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error verifying passcode:', error);
      return false;
    }
  };

  const handleRecordReaction = async (_messageId: string, _videoBlob: Blob): Promise<void> => {
    // Do not re-upload here — the upload is handled inside MessageViewer
    // This just confirms the callback fired correctly
    toast.success('Your reaction has been recorded!');
  };

  const handleSendTextReply = async (_messageId: string, text: string): Promise<void> => {
    const currentReactionId = reactionIdRef.current;

    if (!currentReactionId) {
      toast.error('Reply channel not ready yet. Please wait a moment and try again.');
      return;
    }

    try {
      await repliesApi.sendText(currentReactionId, text);
      toast.success('Your reply has been sent!');
    } catch (error) {
      console.error('Error uploading reply:', error);
      toast.error('Failed to upload reply. Please try again.');
    }
  };

  const handleSkipReaction = async () => {
    if (!id || !message) return;
    try {
      await api.post(`/reactions/${id}/skip`);
      toast.success('You have chosen to skip recording a reaction.');
    } catch (error) {
      console.error('Error skipping reaction:', error);
      toast.success('You have chosen to skip recording a reaction.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600 dark:text-neutral-300">Loading message...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
        <div className="max-w-md text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12 text-red-500 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
            {error === MESSAGE_ERRORS.NOT_FOUND
              ? 'Message Not Found'
              : error === MESSAGE_ERRORS.LINK_EXPIRED
              ? 'Link Expired'
              : 'Error'}
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (needsPasscode && !passcodeVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
        <PasscodeEntry onSubmitPasscode={handleSubmitPasscode} />
      </div>
    );
  }

  if (message && (passcodeVerified || !needsPasscode)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-8 dark:bg-neutral-900">
        <MessageViewer
          message={message}
          onRecordReaction={handleRecordReaction}
          onSkipReaction={handleSkipReaction}
          onSubmitPasscode={handleSubmitPasscode}
          onSendTextReply={handleSendTextReply}
          onInitReactionId={handleInitReactionId}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <div className="text-center">
        <p className="text-neutral-600 dark:text-neutral-300">
          Something went wrong. Please try again later.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 dark:bg-primary-700"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default View;
