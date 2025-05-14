import React, { useState, useEffect, useRef } from 'react';
import useWebcam from '../../hooks/useWebcam';
import useMediaRecorder from '../../hooks/useMediaRecorder';
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
  maxDuration = 180000,
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
  const [webcamInitialized, setWebcamInitialized] = useState<boolean>(false);
  const [recordingCompleted, setRecordingCompleted] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [streamAvailable, setStreamAvailable] = useState<boolean>(false);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 2000;

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

  // Track stream availability
  useEffect(() => {
    if (stream) {
      console.log('Stream is now available');
      setStreamAvailable(true);
    } else {
      console.log('Stream is not available');
      setStreamAvailable(false);
    }
  }, [stream]);

  // Initialize webcam with retry logic
  useEffect(() => {
    if (!isBrowserSupported || webcamInitialized) {
      return;
    }

    const initializeWebcam = async () => {
      try {
        console.log(`Attempting to start webcam (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
        await startWebcam();
        setWebcamInitialized(true);
        console.log('Webcam initialized successfully');
        
        setRetryCount(0);
        
        if (autoStart) {
          console.log('Auto-starting countdown due to autoStart=true');
          setShowCountdown(true);
        }
      } catch (error) {
        console.error('Failed to start webcam:', error);
        
        if (retryCount < MAX_RETRY_ATTEMPTS - 1) {
          console.log(`Retrying webcam initialization in ${RETRY_DELAY}ms`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, RETRY_DELAY);
        } else {
          const errorMsg = 'Failed to access camera/microphone after multiple attempts.';
          setPermissionError(errorMsg);
          onPermissionDenied?.(errorMsg);
        }
      }
    };

    initializeWebcam();

    return () => {
      stopWebcam();
      stopRecording();
    };
  }, [isBrowserSupported, startWebcam, stopWebcam, stopRecording, onPermissionDenied, webcamInitialized, retryCount, autoStart]);

  // Watch for recording completion
  useEffect(() => {
    if (recordingStatus === 'stopped' && recordedBlob) {
      setRecordingCompleted(true);
      setIsRecording(false);
      onRecordingComplete(recordedBlob);
    }
  }, [recordingStatus, recordedBlob, onRecordingComplete]);

  const [countdownValue, setCountdownValue] = useState<number>(countdownDuration);
  
  // Countdown timer implementation with permission handling
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout | null = null;
    let permissionCheckInterval: NodeJS.Timeout | null = null;
    
    if (showCountdown && countdownValue > 0) {
      if (!stream) {
        console.log('Stream not available at countdown start, attempting to ensure permissions');
        
        permissionCheckInterval = setInterval(() => {
          if (stream) {
            console.log('Stream became available during countdown');
            if (permissionCheckInterval) clearInterval(permissionCheckInterval);
          } else {
            console.log('Still waiting for stream during countdown');
            if (!isWebcamLoading) {
              console.log('Attempting to restart webcam during countdown');
              startWebcam().catch(err => console.error('Failed to restart webcam during countdown:', err));
            }
          }
        }, 500);
      }
      
      countdownInterval = setInterval(() => {
        setCountdownValue((prev) => {
          if (prev <= 1) {
            if (countdownInterval) clearInterval(countdownInterval);
            if (permissionCheckInterval) clearInterval(permissionCheckInterval);
            
            setShowCountdown(false);
            
            if (stream) {
              startRecording();
              setIsRecording(true);
              console.log('Recording started after countdown');
              onCountdownComplete?.();
            } else {
              console.error('Cannot start recording: Stream not available after countdown');
              setPermissionError('Camera stream not available. Please try again.');
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
      if (permissionCheckInterval) clearInterval(permissionCheckInterval);
    };
  }, [showCountdown, countdownValue, stream, startRecording, onCountdownComplete, startWebcam, isWebcamLoading]);

  // Reset countdown value when showing countdown
  useEffect(() => {
    if (showCountdown) {
      setCountdownValue(countdownDuration);
    }
  }, [showCountdown, countdownDuration]);

  // Handle cancel
  const handleCancel = () => {
    stopRecording();
    clearRecording();
    setShowCountdown(false);
    setIsRecording(false);
    setRecordingCompleted(false);
    onCancel();
  };

  // Function to retry webcam initialization
  const handleRetryWebcam = () => {
    setPermissionError(undefined);
    setWebcamInitialized(false);
    setRetryCount(0);
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
        <button onClick={onCancel} className="btn btn-outline mt-4">
          Go Back
        </button>
      </div>
    );
  }

  // Render permission error
  if (permissionState === 'denied' || webcamError || permissionError) {
    return (
      <div className="card mx-auto max-w-md text-center">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-400">
          Camera Access Issue
        </h3>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">
          {webcamError?.message || permissionError || "Unable to access your camera and microphone."}
        </p>
        <div className="mt-4 flex justify-center space-x-2">
          <button onClick={handleRetryWebcam} className="btn btn-primary">
            Retry
          </button>
          <button onClick={onCancel} className="btn btn-outline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames('flex flex-col items-center w-full max-w-2xl mx-auto', className || '')}>
      {/* Webcam preview container - smaller during countdown, hidden during recording */}
      <div
        ref={videoContainerRef}
        className="relative overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800"
        style={{
          width: '100%',
          maxWidth: showCountdown ? '320px' : '640px', // Smaller during countdown
          aspectRatio: '16 / 9',
          display: isRecording ? 'none' : 'block', // Hide during recording
        }}
      >
        {isWebcamLoading ? (
          <div className="flex h-full items-center justify-center">
            <svg
              className="h-12 w-12 animate-spin text-primary-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        )}

        {/* Stream status indicator */}
        {webcamInitialized && !streamAvailable && (
          <div className="absolute right-2 top-2 flex items-center rounded-full bg-yellow-500 px-2 py-1 text-xs text-white">
            <span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-white" />
            Reconnecting...
          </div>
        )}

        {/* Recording indicator with red dot and duration */}
        {isRecording && (
          <div className="absolute left-2 top-2 flex items-center rounded-full bg-red-500 px-2 py-1 text-xs text-white">
            <span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-white" />
            Recording: {formatDuration(duration)}
          </div>
        )}

        {/* Countdown overlay */}
        {showCountdown && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col items-center">
              <div className="text-6xl font-bold text-white mb-4">
                {countdownValue}
              </div>
              <div className="mb-4 flex items-center">
                {stream ? (
                  <span className="flex items-center text-green-400 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Camera Ready
                  </span>
                ) : (
                  <span className="flex items-center text-yellow-400 text-sm">
                    <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Setting Up Camera...
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Recording completed overlay */}
        {recordingCompleted && !isRecording && !showCountdown && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 text-white">
            <div className="rounded-full bg-green-500 p-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Recording Complete!</h3>
            <p className="mt-2 text-sm">Your video has been successfully recorded.</p>
          </div>
        )}
      </div>

      {/* Recording time limit notice */}
      {!recordingCompleted && (
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          Maximum recording time: {formatDuration(maxDuration)}
        </p>
      )}
    </div>
  );
};

export default WebcamRecorder;