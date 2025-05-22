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

  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 2000;

  const {
    stream,
    videoRef,
    startWebcam,
    stopWebcam,
  } = useWebcam({ facingMode: 'user', audio: true });

  const {
    status: recordingStatus,
    recordedBlob,
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
    if (showPreview && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [showPreview, stream]);

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

      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [recordingStatus, recordedBlob, recordingCompleted]);

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
              onCountdownComplete?.();

              if (hidePreviewAfterCountdown && !previewManuallyToggled) {
                setShowPreview(false);
              }
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

    return () => clearInterval(interval);
  }, [showCountdown, countdownValue, stream]);

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
    // Attach the stream to video element before and during countdown
    if ((showCountdown || isRecording) && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [showCountdown, isRecording, stream]);

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
    <div className={classNames('flex flex-col items-center', className || '')}>
      <h2 className="text-xl font-semibold mb-2">Record Your Reaction</h2>

      <div className="w-full max-w-md mb-4">
        {(showPreview || showCountdown || isRecording) && !recordingCompleted && (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="rounded shadow-md w-full"
            />
          )}
      </div>

      {retryMessage && <p className="text-sm text-gray-500">{retryMessage}</p>}
      {showCountdown && <div className="text-4xl font-bold text-blue-500 mt-2">{countdownValue}</div>}
      {isRecording && (
        <p className="text-red-500 mt-2 text-sm font-medium">
          Recording... {recordingCountdown !== null ? `${recordingCountdown}s left` : ''}
        </p>
      )}
      {recordingCompleted && (
        <p className="text-green-600 mt-2">Recording complete!</p>
      )}
      {isRecording && !recordingCompleted && (
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
    </div>
  );
};

export default WebcamRecorder;
