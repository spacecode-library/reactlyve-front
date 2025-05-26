import React, { useState, useEffect } from 'react';
import useWebcam from '../../hooks/useWebcam';
import useMediaRecorder from '../../hooks/useMediaRecorder';
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
  hidePreviewAfterCountdown?: boolean;
  triggerCountdownSignal?: boolean;
  onStatusUpdate?: (message: string | null) => void;
  onWebcamError?: (message: string | null) => void;
  isUploading?: boolean;
  hideUploadSpinner?: boolean; // Added new prop
}

const WebcamRecorder: React.FC<WebcamRecorderProps> = ({
  onRecordingComplete,
  onCancel,
  maxDuration = 15000,
  countdownDuration = 5,
  className,
  autoStart = false,
  onPermissionDenied,
  onCountdownComplete,
  isReplyMode = false,
  hidePreviewAfterCountdown = true,
  triggerCountdownSignal,
  onStatusUpdate,
  onWebcamError,
  isUploading = false,
  hideUploadSpinner = false, // Destructured new prop
}) => {
  const [showCountdown, setShowCountdown] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const [permissionError, setPermissionError] = useState<string | undefined>();
  const [webcamInitialized, setWebcamInitialized] = useState(false);
  const [recordingCompleted, setRecordingCompleted] = useState(false);
  const [retryMessage, setRetryMessage] = useState('');
  const [countdownValue, setCountdownValue] = useState(countdownDuration);
  const [recordingCountdown, setRecordingCountdown] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [previewManuallyToggled, setPreviewManuallyToggled] = useState(false);
  const [countdownHasOccurred, setCountdownHasOccurred] = useState(false);

  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 2000;

  const {
    stream,
    videoRef,
    startWebcam,
    stopWebcam,
    error: webcamHookError,
  } = useWebcam({ facingMode: 'user', audio: true });

  const {
    status: recordingStatus,
    recordedBlob,
    startRecording,
    stopRecording,
    clearRecording,
    error: mediaRecorderError,
  } = useMediaRecorder({ stream, maxDuration });

  useEffect(() => {
    if (mediaRecorderError) {
      const errorMsg = `Recording error: ${mediaRecorderError.message}`;
      setPermissionError(errorMsg);
      onWebcamError?.(errorMsg);
      setIsRecording(false);
    }
  }, [mediaRecorderError, onWebcamError]);



  useEffect(() => {
    setIsBrowserSupported(supportsMediaRecording());
  }, []);



  useEffect(() => {
    if (!isBrowserSupported || webcamInitialized) return;

    const tryInitializeWebcam = async (attempt: number) => {
      const statusMsg = `Requesting webcam access... (Attempt ${attempt + 1} of ${MAX_RETRY_ATTEMPTS})`;
      setRetryMessage(statusMsg);
      onStatusUpdate?.(statusMsg);
      try {
        await startWebcam();
        setWebcamInitialized(true);
        setRetryMessage('');
        onStatusUpdate?.(null);
      } catch (err) {
        if (attempt + 1 < MAX_RETRY_ATTEMPTS) {
          setTimeout(() => tryInitializeWebcam(attempt + 1), RETRY_DELAY);
        } else {
          const errorMsg = 'Unable to access camera/microphone. Please check permissions.';
          setPermissionError(errorMsg);
          onWebcamError?.(errorMsg);
          onPermissionDenied?.(errorMsg);
        }
      }
    };

    tryInitializeWebcam(0);

    return () => {
      stopWebcam();
      stopRecording();
    };
  }, [isBrowserSupported, webcamInitialized, autoStart, onStatusUpdate, onWebcamError, onPermissionDenied]);



  useEffect(() => {
    if (webcamHookError) {
      const errorMsg = `Webcam error: ${webcamHookError.message}`;
      setPermissionError(errorMsg);
      onWebcamError?.(errorMsg);
      setWebcamInitialized(false);
      setShowCountdown(false);
    }
  }, [webcamHookError, onWebcamError]);



  useEffect(() => {
    if (webcamInitialized) {
      if (stream) {
        if (autoStart && !countdownHasOccurred) {
          setShowCountdown(true);
        }
      } else if (!webcamHookError && !isRecording && !recordingCompleted) {
        const errorMsg = 'Webcam stream not available after initialization attempt.';
        setPermissionError(errorMsg);
        onWebcamError?.(errorMsg);
        setShowCountdown(false);
        onPermissionDenied?.(errorMsg);
      }
    }
  }, [stream, webcamInitialized, autoStart, onPermissionDenied, webcamHookError, countdownHasOccurred, isRecording, recordingCompleted]);



  useEffect(() => {
    if (showPreview && stream && videoRef.current && webcamInitialized) {
      videoRef.current.srcObject = stream;
    } else if (!stream && videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [showPreview, stream, webcamInitialized, videoRef, triggerCountdownSignal]);



  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);



  useEffect(() => {
    if (recordingStatus === 'stopped' && recordedBlob && !recordingCompleted) {
      setRecordingCompleted(true);
      setIsRecording(false);
      onRecordingComplete(recordedBlob);
      stopWebcam();
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [recordingStatus, recordedBlob, recordingCompleted, onRecordingComplete, stopWebcam]);



  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showCountdown && countdownValue > 0) {
      interval = setInterval(() => {
        setCountdownValue(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowCountdown(false);
            if (webcamInitialized && stream) {
              startRecording();
              setIsRecording(true);
              setRecordingCountdown(maxDuration / 1000);
              setCountdownHasOccurred(true);
              onCountdownComplete?.();
            } else {
              const err = 'Camera stream not available after countdown.';
              setPermissionError(err);
              onWebcamError?.(err);
              onPermissionDenied?.(err);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [showCountdown, countdownValue, stream]);



  useEffect(() => {
    if (
      (isRecording || !showCountdown) &&
      hidePreviewAfterCountdown &&
      !previewManuallyToggled
    ) {
      setShowPreview(false);
    }
  }, [isRecording, showCountdown, hidePreviewAfterCountdown, previewManuallyToggled]);



  useEffect(() => {
    if (showCountdown) setCountdownValue(countdownDuration);
  }, [showCountdown, countdownDuration]);



  useEffect(() => {
    if (!isRecording || recordingCountdown === null) return;

    const interval = setInterval(() => {
      setRecordingCountdown(prev => {
        if (prev && prev > 1) return prev - 1;
        clearInterval(interval);
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording, recordingCountdown]);



  useEffect(() => {
    if ((showCountdown || isRecording) && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [showCountdown, isRecording, stream]);



  useEffect(() => {
    if (triggerCountdownSignal && !isRecording && !recordingCompleted && webcamInitialized && stream) {
      setShowCountdown(true);
    }
  }, [triggerCountdownSignal, webcamInitialized, stream, isRecording, recordingCompleted]);



  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isRecording || isUploading) {
        event.preventDefault();
        event.returnValue = 'Your video is still being processed. Are you sure you want to leave?';
      }
    };

    if (isRecording || isUploading) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRecording, isUploading]);



  const handleRetryWebcam = () => {
    setWebcamInitialized(false);
    setPermissionError(undefined);
    onWebcamError?.(null);
    setRetryMessage('');
    onStatusUpdate?.(null);
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
        <p>Your browser does not support webcam recording. Please try on another device or browser.</p>
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
    <div className={classNames('relative flex flex-col items-center justify-center text-center', className || '')}>

      <h2 className="text-xl font-semibold mb-2">Record Your Lyve Reaction</h2>

      {((showCountdown && !previewManuallyToggled) || showPreview) && (
        <div className="relative w-full max-w-md mt-2 mb-4 aspect-video">

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="rounded shadow-md w-full h-full object-cover"
          />

          {showCountdown && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl font-bold text-white drop-shadow-md">{countdownValue}</div>
            </div>
          )}
        </div>
      )}

      {isRecording && (
        <p className="text-red-500 mt-2 text-sm font-medium">
          Recording... {recordingCountdown !== null ? `${recordingCountdown}s left` : ''}
        </p>
      )}

      {recordingCompleted && (
        <p className="text-green-600 mt-2">Recording complete!</p>
      )}

      {isRecording && (
        <button
          className="text-sm text-primary-600 underline mt-2"
          onClick={() => {
            setShowPreview(prev => !prev);
            setPreviewManuallyToggled(true);
          }}
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      )}

      {isUploading && !hideUploadSpinner && ( // Modified condition
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

    </div>
  );
};

export default WebcamRecorder;
