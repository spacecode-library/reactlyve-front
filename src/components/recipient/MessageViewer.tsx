import React, { useState, useEffect } from 'react';
import { Motion, spring } from 'react-motion';
import { classNames } from '../../utils/classNames';
import Button from '../common/Button';
import WebcamRecorder from './WebcamRecorder';
import { formatRelativeTime } from '../../utils/formatters';

interface MessageViewerProps {
  message: {
    id: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
    sender?: {
      name: string;
      picture?: string;
    };
  };
  onRecordReaction: (messageId: string, videoBlob: Blob) => Promise<void>;
  onSkipReaction?: () => void;
  className?: string;
}

const MessageViewer: React.FC<MessageViewerProps> = ({
  message,
  onRecordReaction,
  onSkipReaction,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Animate in when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle recording completion
  const handleRecordingComplete = async (blob: Blob) => {
    setIsLoading(true);
    
    try {
      await onRecordReaction(message.id, blob);
    } catch (error) {
      console.error('Error uploading reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle start recording
  const handleStartRecording = () => {
    setShowRecorder(true);
  };
  
  // Handle cancel recording
  const handleCancelRecording = () => {
    setShowRecorder(false);
  };
  
  // Handle skip reaction
  const handleSkipReaction = () => {
    if (onSkipReaction) {
      onSkipReaction();
    }
  };
  
  // If recording, show the webcam recorder
  if (showRecorder) {
    return (
      <div className={classNames('flex flex-col', className || '')}>
        <WebcamRecorder
          onRecordingComplete={handleRecordingComplete}
          onCancel={handleCancelRecording}
          maxDuration={20000} // 20 seconds
          countdownDuration={3} // 3 seconds
        />
      </div>
    );
  }
  
  return (
    <div className={classNames('mx-auto max-w-2xl', className || '')}>
      <Motion
        defaultStyle={{ opacity: 0, y: 20 }}
        style={{
          opacity: spring(isVisible ? 1 : 0),
          y: spring(isVisible ? 0 : 20),
        }}
      >
        {interpolatedStyle => (
          <div
            className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-neutral-800"
            style={{
              opacity: interpolatedStyle.opacity,
              transform: `translateY(${interpolatedStyle.y}px)`,
            }}
          >
            {/* Message content */}
            <div className="p-6">
              {/* Sender info (if available) */}
              {message.sender && (
                <div className="mb-4 flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      src={message.sender.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender.name)}&background=random`}
                      alt={message.sender.name}
                      className="h-10 w-10 rounded-full"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {message.sender.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatRelativeTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Message text */}
              <div className="prose prose-sm max-w-none dark:prose-invert sm:prose-base">
                {message.content.split('\n').map((line, index) => (
                  <p key={index} className="whitespace-pre-line">
                    {line}
                  </p>
                ))}
              </div>
              
              {/* Message image (if available) */}
              {message.imageUrl && (
                <div className="mt-4">
                  <img
                    src={message.imageUrl}
                    alt="Message attachment"
                    className="mx-auto max-h-96 max-w-full rounded-md object-contain"
                  />
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-between border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-700 dark:bg-neutral-900">
              <Button
                variant="outline"
                onClick={handleSkipReaction}
                disabled={isLoading}
              >
                Skip Reaction
              </Button>
              
              <Button
                variant="primary"
                onClick={handleStartRecording}
                disabled={isLoading}
                isLoading={isLoading}
                rightIcon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-1 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                }
              >
                Record Reaction
              </Button>
            </div>
          </div>
        )}
      </Motion>
      
      <div className="mt-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
        <p>
          Your reaction will be recorded via webcam and sent back to the sender.
        </p>
        <p className="mt-1">
          Make sure your camera and microphone are enabled.
        </p>
      </div>
    </div>
  );
};

export default MessageViewer;