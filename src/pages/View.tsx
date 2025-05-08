import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MESSAGE_ROUTES, REACTION_ROUTES } from '../components/constants/apiRoutes.ts';
import { MESSAGE_ERRORS } from '../components/constants/errorMessages';
import PasscodeEntry from '../components/recipient/PasscodeEntry';
import MessageViewer from '../components/recipient/MessageViewer';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface MessageData {
  id: string;
  content: string;
  imageUrl?: string;
  hasPasscode: boolean;
  viewCount: number;
  createdAt: string;
  sender?: {
    name: string;
    picture?: string;
  };
}

const View: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [message, setMessage] = useState<MessageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsPasscode, setNeedsPasscode] = useState(false);
  const [passcodeVerified, setPasscodeVerified] = useState(false);
  const [reactionComplete, setReactionComplete] = useState(false);
  
  // Fetch message data
  useEffect(() => {
    const fetchMessage = async () => {
      if (!id) {
        setError('Invalid message link');
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.get(MESSAGE_ROUTES.GET_BY_ID(id));
        const messageData = response.data;
        
        setMessage(messageData);
        setNeedsPasscode(messageData.hasPasscode && !messageData.passcodeVerified);
        setPasscodeVerified(messageData.passcodeVerified || false);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching message:', error);
        
        // Handle specific error cases
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setError(MESSAGE_ERRORS.NOT_FOUND);
          } else if (error.response?.status === 401) {
            setError(MESSAGE_ERRORS.INVALID_PASSCODE);
            setNeedsPasscode(true);
          } else if (error.response?.status === 410) {
            setError(MESSAGE_ERRORS.LINK_EXPIRED);
          } else {
            setError(MESSAGE_ERRORS.NOT_FOUND);
          }
        } else {
          setError('Failed to load message. Please try again later.');
        }
        
        setLoading(false);
      }
    };
    
    fetchMessage();
  }, [id]);
  
  // Handle passcode submission
  const handleSubmitPasscode = async (passcode: string): Promise<boolean> => {
    if (!id) return false;
    
    try {
      const response = await axios.post(MESSAGE_ROUTES.VERIFY_PASSCODE(id), { passcode });
      
      if (response.data.verified) {
        setPasscodeVerified(true);
        setMessage(response.data.message);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying passcode:', error);
      return false;
    }
  };
  
  // Handle recording reaction
  const handleRecordReaction = async (messageId: string, videoBlob: Blob): Promise<void> => {
    try {
      await axios.post(REACTION_ROUTES.UPLOAD(messageId), videoBlob, {
        headers: {
          'Content-Type': 'video/webm',
        },
      });
      
      setReactionComplete(true);
      toast.success('Your reaction has been recorded!');
    } catch (error) {
      console.error('Error uploading reaction:', error);
      toast.error('Failed to upload reaction. Please try again.');
      throw error;
    }
  };
  
  // Handle skip reaction
  const handleSkipReaction = () => {
    setReactionComplete(true);
    toast.success('You have chosen to skip recording a reaction.');
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600 dark:text-neutral-300">
            Loading message...
          </p>
        </div>
      </div>
    );
  }
  
  // Error state
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
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
            className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }
  
  // Reaction complete state
  if (reactionComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
        <div className="max-w-md text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12 text-green-500 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
            Thank You!
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Your response has been recorded and shared with the sender.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }
  
  // Passcode entry state
  if (needsPasscode && !passcodeVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900">
        <PasscodeEntry onSubmitPasscode={handleSubmitPasscode} />
      </div>
    );
  }
  
  // Message viewer state
  if (message && (passcodeVerified || !needsPasscode)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-8 dark:bg-neutral-900">
        <MessageViewer
          message={message}
          onRecordReaction={handleRecordReaction}
          onSkipReaction={handleSkipReaction}
        />
      </div>
    );
  }
  
  // Fallback for any other state (shouldn't happen)
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <div className="text-center">
        <p className="text-neutral-600 dark:text-neutral-300">
          Something went wrong. Please try again later.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-600"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default View;