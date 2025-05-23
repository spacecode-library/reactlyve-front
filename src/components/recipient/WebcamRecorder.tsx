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
  triggerCountdownSignal, // Add triggerCountdownSignal here
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
  const [countdownHasOccurred, setCountdownHasOccurred] = useState(false); // New state variable
  // triggerCountdownSignal is a prop, not state here

  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 2000;

  const {
    stream,
    videoRef,
    startWebcam,
    stopWebcam,
    error: webcamHookError, // Destructure error as webcamHookError
  } = useWebcam({ facingMode: 'user', audio: true });

  useEffect(() => {
    if (webcamHookError) {
      setPermissionError(`Webcam error: ${webcamHookError.message}`);
      setWebcamInitialized(false);
      setShowCountdown(false); // Prevent countdown if webcam failed
    }
  }, [webcamHookError]);

  const {
    status: recordingStatus,
    recordedBlob,
    startRecording,
    stopRecording,
    clearRecording,
    error: mediaRecorderError, // Ensure this is destructured
  } = useMediaRecorder({ stream, maxDuration });

  useEffect(() => {
    if (mediaRecorderError) {
      setPermissionError(`Recording error: ${mediaRecorderError.message}`);
      setIsRecording(false); // Ensure we are not in recording state
    }
  }, [mediaRecorderError]);

  useEffect(() => {
    if (recordingStatus === 'error') {
      // This case might be redundant if mediaRecorderError useEffect handles it,
      // but good as a fallback.
      setPermissionError(mediaRecorderError?.message || 'An unknown recording error occurred.');
      setIsRecording(false);
    }
  }, [recordingStatus, mediaRecorderError]); // Added mediaRecorderError here too

  useEffect(() => {
    setIsBrowserSupported(supportsMediaRecording());
  }, []);

  useEffect(() => {
    if (!isBrowserSupported || webcamInitialized) return;

    const tryInitializeWebcam = async (attempt: number) => {
      setRetryMessage(`Requesting webcam access... (Attempt ${attempt + 1} of ${MAX_RETRY_ATTEMPTS})`);
      try {
        await startWebcam();

        // stream check removed
        // setShowCountdown call removed

        setWebcamInitialized(true);
        setRetryMessage('');
        // Note: if (autoStart) setShowCountdown(true); was removed from here
      } catch (err) {
        // The existing catch block will handle errors from startWebcam() or the explicit throw
        // It's important that this catch block does NOT set webcamInitialized to true.
        // If it's a final error, webcamInitialized should remain false or be set to false.
        // The current catch block which sets permissionError is fine.
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
    if (webcamInitialized) { // Only proceed if initialization was attempted and deemed successful by tryInitializeWebcam
      if (stream) { // If stream is now available
        if (autoStart && !countdownHasOccurred) { // Modified condition
          setShowCountdown(true);
        }
        // Optional: Clear a permissionError if it was set by a previous failed attempt in this effect
        // This might need careful consideration if setPermissionError(undefined) is appropriate here or if
        // the webcamHookError effect already handles clearing it implicitly when webcamHookError becomes null.
        // For now, let's focus on setShowCountdown.
        // setPermissionError(undefined); // Potentially clear if stream is now OK.
      } else if (!webcamHookError && !isRecording && !recordingCompleted) { // Condition updated
        // Stream is not available, AND useWebcam hook itself hasn't reported an error,
        // AND we are not currently recording or already completed.
        // This is the "silent failure" or timing issue for the stream.
        const errorMsg = 'Webcam stream not available after initialization attempt.';
        setPermissionError(errorMsg);
        setShowCountdown(false); // Ensure countdown doesn't start/continue
        onPermissionDenied?.(errorMsg); // Notify parent if prop provided
      }
      // If webcamHookError is present, the other useEffect (dedicated to webcamHookError)
      // should have already handled setting permissionError and setShowCountdown(false).
    }
  }, [stream, webcamInitialized, autoStart, onPermissionDenied, webcamHookError, countdownHasOccurred, isRecording, recordingCompleted]); // Dependencies updated

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
      stopWebcam(); // Add this line to deactivate the webcam

      // The following lines that manually stop tracks on videoRef.current.srcObject
      // might become redundant if stopWebcam() already handles stream track stopping.
      // For now, we can leave them, but it's something to note.
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [recordingStatus, recordedBlob, recordingCompleted, onRecordingComplete, stopWebcam]); // Add onRecordingComplete and stopWebcam

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
              setCountdownHasOccurred(true); // Set countdownHasOccurred to true
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

    return () => clearInterval(interval);
  }, [showCountdown, countdownValue, stream]);

  useEffect(() => {
    // When recording begins or countdown finishes, auto-hide preview if requested and not manually toggled
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
    // Attach stream again during countdown or recording if lost
    if ((showCountdown || isRecording) && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [showCountdown, isRecording, stream]);

  useEffect(() => {
    if (triggerCountdownSignal && !isRecording && !recordingCompleted && webcamInitialized && stream) {
      // Check webcamInitialized and stream to ensure webcam is ready
      // Check !isRecording and !recordingCompleted to prevent re-triggering
      setShowCountdown(true);
    }
  }, [triggerCountdownSignal, webcamInitialized, stream, isRecording, recordingCompleted]);

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
      <h2 className="text-xl font-semibold mb-2">Record Your Lyve Reaction</h2>

      {((showCountdown && !previewManuallyToggled) || showPreview) && (
        <div className="w-full max-w-md my-4">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="rounded shadow-md w-full"
          />
        </div>
      )}

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
    </div>
  );
};

export default WebcamRecorder;
