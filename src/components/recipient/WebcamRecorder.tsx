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
  maxDuration = 15000, // 15 seconds
  countdownDuration = 5,
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
  const [retryMessage, setRetryMessage] = useState<string>('');
  const [countdownValue, setCountdownValue] = useState<number>(countdownDuration);

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
  } = useWebcam({ facingMode: 'user', audio: true });

  const {
    status: recordingStatus,
    recordedBlob,
    duration,
    error: recordingError,
    startRecording,
    stopRecording,
    clearRecording,
  } = useMediaRecorder({ stream, maxDuration });

  useEffect(() => {
    setIsBrowserSupported(supportsMediaRecording());
  }, []);

  useEffect(() => {
    if (!isBrowserSupported || webcamInitialized) return;

    const tryInitializeWebcam = async (attempt: number) => {
      setRetryMessage(`Requesting webcam access... (Attempt ${attempt + 1} of ${MAX_RETRY_ATTEMPTS})`);
      try {
        await startWebcam();
        setWebcamInitialized(true);
        setRetryMessage('');
        if (autoStart) setShowCountdown(true);
      } catch (err) {
        if (attempt + 1 < MAX_RETRY_ATTEMPTS) {
          setTimeout(() => tryInitializeWebcam(attempt + 1), RETRY_DELAY);
        } else {
          const errorMsg = 'Unable to access camera/microphone. Please check permissions.';
          setPermissionError(errorMsg);
          onPermissionDenied?.(errorMsg);
        }
      }
    };

    tryInitializeWebcam(0);

    return () => {
      stopWebcam();
      stopRecording();
    };
  }, [isBrowserSupported, webcamInitialized, autoStart]);

  useEffect(() => {
    if (recordingStatus === 'stopped' && recordedBlob) {
      setRecordingCompleted(true);
      setIsRecording(false);
      onRecordingComplete(recordedBlob);
    }
  }, [recordingStatus, recordedBlob]);

  // Countdown logic
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    if (showCountdown && countdownValue > 0) {
      countdownInterval = setInterval(() => {
        setCountdownValue((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setShowCountdown(false);
            if (stream) {
              startRecording();
              setIsRecording(true);
              onCountdownComplete?.();
            } else {
              const err = 'Camera stream not available after countdown.';
              setPermissionError(err);
              onPermissionDenied?.(err);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownInterval);
  }, [showCountdown, countdownValue]);

  useEffect(() => {
    if (showCountdown) setCountdownValue(countdownDuration);
  }, [showCountdown, countdownDuration]);

  const handleRetryWebcam = () => {
    setWebcamInitialized(false);
    setPermissionError(undefined);
    setRetryMessage('');
  };

  const handleCancel = () => {
    stopRecording();
    clearRecording();
    setShowCountdown(false);
    setIsRecording(false);
    setRecordingCompleted(false);
    onCancel();
  };

  if (!isBrowserSupported) {
    return (
      <div className="text-center text-red-600">
        <p>Your browser does not support webcam recording.</p>
        <button onClick={onCancel} className="btn btn-outline mt-2">Go Back</button>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="text-center text-red-600">
        <p>{permissionError}</p>
        <div className="mt-4 space-x-2">
          <button onClick={handleRetryWebcam} className="btn btn-primary">Retry</button>
          <button onClick={handleCancel} className="btn btn-outline">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames('flex flex-col items-center', className || '')}>
      <h2 className="text-xl font-semibold mb-2">Record Your Reaction</h2>
      <video ref={videoRef} autoPlay muted playsInline className="rounded shadow-md w-full max-w-md mb-4" />
      {retryMessage && <p className="text-sm text-gray-500">{retryMessage}</p>}
      {showCountdown && (
        <div className="text-4xl font-bold text-blue-500 mt-2">
          {countdownValue}
        </div>
      )}
      {isRecording && (
        <p className="text-red-500 mt-2 text-sm">
          Recording... {formatDuration(duration)}
        </p>
      )}
      {recordingCompleted && (
        <p className="text-green-600 mt-2">Recording complete!</p>
      )}
    </div>
  );
};

export default WebcamRecorder;
