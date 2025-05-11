import React, { useState, useEffect, useRef } from 'react';
import useWebcam from '../../hooks/useWebcam';
import useMediaRecorder from '../../hooks/useMediaRecorder';
import CountdownTimer from './CountdownTimer';
import PermissionRequest from './PermissionRequest';
import { formatDuration } from '../../utils/formatters';
import { supportsMediaRecording } from '../../utils/validators';
import { classNames } from '../../utils/classNames';

interface WebcamRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onCancel: () => void;
  maxDuration?: number;
  countdownDuration?: number;
  className?: string;
  autoStart?: boolean;
  onPermissionDenied?: (error: string) => void;
  onCountdownComplete?: () => void; 
  isReplyMode?: boolean;
}

const WebcamRecorder: React.FC<WebcamRecorderProps> = ({
  onRecordingComplete,
  onCancel,
  maxDuration = 30000,
  countdownDuration = 3,
  className,
  autoStart = false,
  onPermissionDenied,
  onCountdownComplete,
  isReplyMode = false,
}) => {
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isBrowserSupported, setIsBrowserSupported] = useState<boolean>(true);
  const [permissionError, setPermissionError] = useState<string | undefined>(undefined);

  const videoContainerRef = useRef<HTMLDivElement>(null);

  const {
    stream,
    videoRef,
    isLoading: isWebcamLoading,
    error: webcamError,
    startWebcam,
    stopWebcam,
    permissionState,
  } = useWebcam({
    facingMode: 'user',
    audio: true,
  });

  const {
    status: recordingStatus,
    recordedBlob,
    duration,
    error: recordingError,
    startRecording,
    stopRecording,
    clearRecording,
  } = useMediaRecorder({
    stream,
    maxDuration,
  });

  // Check browser support
  useEffect(() => {
    setIsBrowserSupported(supportsMediaRecording());
  }, []);

  // Initialize webcam and handle auto-start
  useEffect(() => {
    if (isBrowserSupported && autoStart) {
      startWebcam()
        .then(() => {
          if (permissionState === 'granted') {
            setShowCountdown(true);
            startRecording();
            setIsRecording(true);
          }
        })
        .catch(error => {
          console.error('Failed to start webcam:', error);
          setPermissionError(error.message || 'Failed to access camera/microphone.');
          onPermissionDenied?.(error.message || 'Failed to access camera/microphone.');
        });
    }

    return () => {
      // Delay cleanup to avoid interrupting play()
      setTimeout(() => {
        stopWebcam();
        stopRecording();
      }, 300);
    };
  }, [isBrowserSupported, autoStart, startWebcam, stopWebcam, stopRecording, permissionState, startRecording, onPermissionDenied]);

  // Watch for recording completion
  useEffect(() => {
    if (recordingStatus === 'stopped' && recordedBlob) {
      onRecordingComplete(recordedBlob);
      setIsRecording(false);
    }
  }, [recordingStatus, recordedBlob, onRecordingComplete]);

  // Handle countdown completion
  const handleCountdownComplete = () => {
    setShowCountdown(false);
    if (!isRecording) {
      startRecording();
      setIsRecording(true);
    }
    onCountdownComplete?.();
  };

  // Handle cancel
  const handleCancel = () => {
    stopRecording();
    clearRecording();
    onCancel();
  };

  // Handle stop recording
  const handleStopRecording = () => {
    stopRecording();
    setIsRecording(false);
  };

  // Handle start recording
  const handleStartRecording = () => {
    if (stream && recordingStatus === 'inactive') {
      setShowCountdown(true);
    }
  };

  // Render browser not supported
  if (!isBrowserSupported) {
    return (
      <div className="card mx-auto max-w-md text-center">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-400">
          Browser Not Supported
        </h3>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">
          Your browser does not support video recording. Please try a modern browser like Chrome, Firefox, or Edge.
        </p>
        <button
          onClick={onCancel}
          className="btn btn-outline mt-4"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Render permission error
  if (permissionState === 'denied' || webcamError || permissionError) {
    return (
      <PermissionRequest
        onCancel={onCancel}
        permissionType="both"
        errorMessage={webcamError?.message || permissionError}
        isReplyMode={isReplyMode}
      />
    );
  }

  return (
    <div className={classNames('flex flex-col items-center w-full max-w-2xl mx-auto', className || '')}>
      {/* Webcam preview container */}
      <div
        ref={videoContainerRef}
        className="relative overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800"
        style={{ width: '100%', maxWidth: '640px', aspectRatio: '16 / 9' }}
      >
        {isWebcamLoading ? (
          <div className="flex h-full items-center justify-center">
            <svg
              className="h-12 w-12 animate-spin text-primary-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute left-4 top-4 flex items-center rounded-full bg-red-500 px-3 py-1 text-sm text-white">
            <span className="mr-2 h-3 w-3 animate-pulse rounded-full bg-white"></span>
            Recording: {formatDuration(duration)}
          </div>
        )}

        {/* Countdown overlay */}
        {showCountdown && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <CountdownTimer
              duration={countdownDuration}
              onComplete={handleCountdownComplete}
              onCancel={handleCancel}
              size="lg"
            />
          </div>
        )}

        {/* Guide overlay for reply mode */}
        {!isRecording && !showCountdown && !autoStart && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 p-4 text-center text-white">
            <h3 className="text-xl font-medium">
              {isReplyMode ? 'Ready to record your reply?' : 'Ready to capture your reaction?'}
            </h3>
            <p className="mt-2 max-w-md text-sm">
              Position yourself in frame and click the button below to start recording.
              We'll count down from {countdownDuration} before recording begins.
            </p>
          </div>
        )}
      </div>

      {/* Control buttons */}
      {!autoStart && (
        <div className="mt-4 flex space-x-4">
          {isRecording ? (
            <button
              onClick={handleStopRecording}
              className="btn btn-primary bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <rect x="6" y="6" width="8" height="8" />
              </svg>
              Stop Recording
            </button>
          ) : (
            <button
              onClick={handleStartRecording}
              disabled={!stream || isWebcamLoading || showCountdown}
              className="btn btn-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <circle cx="10" cy="10" r="6" />
              </svg>
              Start Recording
            </button>
          )}
          <button
            onClick={handleCancel}
            className="btn btn-outline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Error message */}
      {recordingError && (
        <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-300">
            {recordingError.message}
          </p>
        </div>
      )}

      {/* Recording time limit notice */}
      <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
        Maximum recording time: {formatDuration(maxDuration)}
      </p>
    </div>
  );
};

export default WebcamRecorder;
