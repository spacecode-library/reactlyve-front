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
  maxDuration?: number; // in milliseconds
  countdownDuration?: number; // in seconds
  className?: string;
}

const WebcamRecorder: React.FC<WebcamRecorderProps> = ({
  onRecordingComplete,
  onCancel,
  maxDuration = 20000, // 20 seconds
  countdownDuration = 3, // 3 seconds
  className,
}) => {
  const [showCountdown, setShowCountdown] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isBrowserSupported, setIsBrowserSupported] = useState<boolean>(true);
  
  // Refs
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  // Setup webcam hook
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
  
  // Setup media recorder hook
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
  
  // Initialize webcam when component mounts
  useEffect(() => {
    if (isBrowserSupported) {
      startWebcam().catch(error => {
        console.error('Failed to start webcam:', error);
      });
    }
    
    return () => {
      stopWebcam();
    };
  }, [isBrowserSupported, startWebcam, stopWebcam]);
  
  // Watch for recording completion
  useEffect(() => {
    if (recordingStatus === 'stopped' && recordedBlob) {
      onRecordingComplete(recordedBlob);
    }
  }, [recordingStatus, recordedBlob, onRecordingComplete]);
  
  // Handle countdown completion
  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setIsRecording(true);
    startRecording();
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (recordingStatus === 'recording') {
      stopRecording();
    }
    clearRecording();
    onCancel();
  };
  
  // Handle stop recording
  const handleStopRecording = () => {
    if (recordingStatus === 'recording') {
      stopRecording();
      setIsRecording(false);
    }
  };
  
  // Handle start recording (shows countdown first)
  const handleStartRecording = () => {
    if (stream && recordingStatus === 'inactive') {
      setShowCountdown(true);
    }
  };
  
  // If browser is not supported
  if (!isBrowserSupported) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-400">
          Browser Not Supported
        </h3>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300">
          Your browser does not support video recording. Please try a modern browser like Chrome, Firefox, or Edge.
        </p>
        <button
          onClick={onCancel}
          className="mt-4 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  // If waiting for permissions or permission denied
  if (permissionState === 'denied' || webcamError) {
    return (
      <PermissionRequest
        onCancel={onCancel}
        permissionType="camera"
        errorMessage={webcamError?.message}
      />
    );
  }
  
  return (
    <div className={classNames('flex flex-col items-center', className || '')}>
      {/* Webcam preview container */}
      <div
        ref={videoContainerRef}
        className="relative overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800"
        style={{ width: '100%', maxWidth: '640px', aspectRatio: '16 / 9' }}
      >
        {/* Video element for webcam preview */}
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
              onCancel={() => setShowCountdown(false)}
              size="lg"
            />
          </div>
        )}
        
        {/* Recording guide overlay */}
        {!isRecording && !showCountdown && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 p-4 text-center text-white">
            <h3 className="text-xl font-medium">Ready to capture your reaction?</h3>
            <p className="mt-2 max-w-md text-sm">
              Position yourself in frame and click the button below when you're ready to record.
              We'll count down from {countdownDuration} before recording begins.
            </p>
          </div>
        )}
      </div>
      
      {/* Control buttons */}
      <div className="mt-4 flex space-x-4">
        {isRecording ? (
          <button
            onClick={handleStopRecording}
            className="flex items-center rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
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
            className="flex items-center rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-primary-400 dark:bg-primary-700 dark:hover:bg-primary-600 dark:disabled:bg-primary-800"
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
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          Cancel
        </button>
      </div>
      
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