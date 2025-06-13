import { FFmpeg, FileData } from '@ffmpeg/ffmpeg'; // Added
import { fetchFile, toBlobURL } from '@ffmpeg/util'; // Added
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import useWebcam from '../../hooks/useWebcam';
import useMediaRecorder from '../../hooks/useMediaRecorder';
import Button from '../common/Button';
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
  onRecordingStatusChange?: (isRecording: boolean) => void; // New prop
}

// Add FFmpeg core path constant (if not already globally available, define it here)
const FFMPEG_CORE_BASE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'; // Or your self-hosted path
const COMPRESSION_THRESHOLD_BYTES = 10 * 1024 * 1024; // 10MB

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
  onRecordingStatusChange, // Destructure
}) => {
  const ffmpegRef = useRef(new FFmpeg()); // Added
  const stopWebcamRef = useRef<() => void>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false); // Added
  const [compressionProgress, setCompressionProgress] = useState<number>(0); // Added
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
    duration: recorderDuration,
  } = useMediaRecorder({ stream, maxDuration });

  useEffect(() => {
    if (mediaRecorderError) {
      const errorMsg = `Recording error: ${mediaRecorderError.message}`;
      setPermissionError(errorMsg);
      onWebcamError?.(errorMsg);
      if (isRecording) {
        // Check if it was recording
        onRecordingStatusChange?.(false);
      }
      setIsRecording(false);
    }
  }, [mediaRecorderError, onWebcamError, isRecording, onRecordingStatusChange]);

  useEffect(() => {
    setIsBrowserSupported(supportsMediaRecording());
  }, []);

  useEffect(() => {
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('log', logEntry => {
      // console.log(`FFmpeg internal log (WebcamRecorder): ${logEntry.message}`);
      if (
        typeof logEntry.message === 'string' &&
        logEntry.message.toLowerCase().includes('error')
      ) {
        console.error(`FFmpeg Error Log (WebcamRecorder): ${logEntry.message}`);
      }
    });

    const loadFFmpeg = async () => {
      if (!ffmpeg.loaded) {
        try {
          const coreURL = await toBlobURL(
            `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`,
            'text/javascript'
          );
          const wasmURL = await toBlobURL(
            `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`,
            'application/wasm'
          );
          // console.log('Loading FFmpeg core (WebcamRecorder)...');
          await ffmpeg.load({ coreURL, wasmURL });
          // console.log('FFmpeg core loaded (WebcamRecorder).');
        } catch (err) {
          console.error('Failed to load FFmpeg core (WebcamRecorder):', err);
          onWebcamError?.('Failed to load video compression components.');
        }
      }
    };
    if (webcamInitialized) {
      loadFFmpeg();
    }

    return () => {
      if (ffmpeg.loaded) {
        // console.log('Terminating FFmpeg on WebcamRecorder unmount');
        ffmpeg.terminate();
      }
    };
  }, [webcamInitialized, onWebcamError]);

  useEffect(() => {
    if (!isBrowserSupported || webcamInitialized) return;

    const tryInitializeWebcam = async (attempt: number) => {
      const statusMsg = `Requesting webcam access... (Attempt ${
        attempt + 1
      } of ${MAX_RETRY_ATTEMPTS})`;
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
  }, [
    isBrowserSupported,
    webcamInitialized,
    autoStart,
    onStatusUpdate,
    onWebcamError,
    onPermissionDenied,
  ]);

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
  }, [
    stream,
    webcamInitialized,
    autoStart,
    onPermissionDenied,
    webcamHookError,
    countdownHasOccurred,
    isRecording,
    recordingCompleted,
  ]);

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
    const processAndCompleteRecording = async (blob: Blob) => {
      let blobToUpload = blob;
      let processingError: Error | null = null;

      // Outer try/finally to ensure webcam is stopped once processing is attempted.
      try {
        if (blob.size > COMPRESSION_THRESHOLD_BYTES && ffmpegRef.current.loaded) {
          setIsCompressing(true);
          onStatusUpdate?.('Compressing video...');

          try {
            ffmpegRef.current.on('progress', ({ progress }) => {
              setCompressionProgress(progress < 0 ? 0 : progress > 1 ? 1 : progress);
            });

            const inputFileName = 'input.webm';
            const outputFileName = 'output_compressed.mp4';

            await ffmpegRef.current.writeFile(inputFileName, await fetchFile(blob));

            const connection = (navigator as any).connection;
            const crfValue =
              connection && connection.downlink && connection.downlink < 1 ? '30' : '25';

            const ffmpegCommand = [
              '-i',
              inputFileName,
              '-vf',
              "scale='if(gt(iw,ih),1280,-2)':'if(gt(iw,ih),-2,1280)'",
              '-c:v',
              'libx264',
              '-crf',
              crfValue,
              '-preset',
              'ultrafast',
              '-movflags',
              '+faststart',
              '-loglevel',
              'error',
              outputFileName,
            ];
            await ffmpegRef.current.exec(ffmpegCommand);

            const data: FileData = await ffmpegRef.current.readFile(outputFileName);
            if (data instanceof Uint8Array && data.length > 0) {
              blobToUpload = new Blob([data.buffer], { type: 'video/mp4' });
            } else {
              console.error(
                'FFmpeg (WebcamRecorder): Compression resulted in a zero-byte or non-Uint8Array file. Using original.'
              );
              onWebcamError?.('Compression failed. Uploading original.');
              blobToUpload = blob; // Ensure original blob is used
            }
            await ffmpegRef.current.deleteFile(inputFileName);
            await ffmpegRef.current.deleteFile(outputFileName);
          } catch (error) {
            console.error('Error during video compression (WebcamRecorder):', error);
            onWebcamError?.('Error during compression. Uploading original.');
            processingError = error as Error; // Store error, will upload original
            blobToUpload = blob; // Fallback to original blob
          } finally {
            setIsCompressing(false);
            setCompressionProgress(0);
            onStatusUpdate?.(null);
          }
        } else {
          if (blob.size > COMPRESSION_THRESHOLD_BYTES && !ffmpegRef.current.loaded) {
            onWebcamError?.('Compression components not ready. Uploading original.');
          }
          // console.log('[WebcamRecorder] Skipping compression.'); // Optional log
        }
      } catch (error) {
        // Catch any unexpected errors during the decision/setup for compression
        console.error('[WebcamRecorder] Error in processing logic:', error);
        processingError = error as Error;
        blobToUpload = blob; // Ensure blobToUpload is the original blob
      } finally {
        stopWebcam(); // Ensure webcam is stopped regardless of processing success/failure.
      }

      // Now that webcam is stopped, call the completion callback.
      // This happens outside the try/finally for stopping the webcam.
      if (processingError) {
        // If there was a processing error, onRecordingComplete still needs to be called
        // so the application flow can continue (e.g. upload original, show error message)
        // console.log('[WebcamRecorder] Processing error occurred, calling onRecordingComplete with original blob.'); // Removed
      } else {
        // console.log('[WebcamRecorder] Processing complete, calling onRecordingComplete.'); // Removed
      }
      onRecordingComplete(blobToUpload);
    };

    if (recordingStatus === 'stopped' && recordedBlob && !recordingCompleted) {
      setRecordingCompleted(true);
      setIsRecording(false); // This state indicates UI should hide recording elements
      onRecordingStatusChange?.(false);

      // Stop webcam right away so the camera light turns off while we process
      stopWebcam();

      const runProcessing = async () => {
        await processAndCompleteRecording(recordedBlob);
        // Any other state updates that depend on processing being fully done
      };
      runProcessing();
    }
  }, [
    recordingStatus,
    recordedBlob,
    recordingCompleted,
    onRecordingComplete,
    stopWebcam,
    onWebcamError,
    onStatusUpdate,
  ]);

  // Add this new useEffect for failsafe cleanup:
  useEffect(() => {
    stopWebcamRef.current = stopWebcam;
  }, [stopWebcam]);

  // Modify the cleanup useEffect:
  useEffect(() => {
    // console.log('[WebcamRecorder] Component did mount, registering unmount cleanup effect.'); // Removed
    return () => {
      // console.log('[WebcamRecorder] Component will unmount, calling stopWebcam via ref from cleanup effect.'); // Removed
      if (stopWebcamRef.current) {
        stopWebcamRef.current();
      }
    };
  }, []); // Empty dependency array means this effect runs only on mount and cleans up only on unmount.

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
              onRecordingStatusChange?.(true); // <<< ADD THIS
              setRecordingCountdown(maxDuration / 1000);
              setCountdownHasOccurred(true);
              onCountdownComplete?.();
            } else {
              const err = 'Camera stream not available after countdown.';
              if (isRecording) {
                // Check if it was recording
                onRecordingStatusChange?.(false);
              }
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
  }, [
    showCountdown,
    countdownValue,
    stream,
    isRecording,
    onRecordingStatusChange,
    onCountdownComplete,
    maxDuration,
    onPermissionDenied,
    onWebcamError,
    webcamInitialized,
  ]);

  useEffect(() => {
    if ((isRecording || !showCountdown) && hidePreviewAfterCountdown && !previewManuallyToggled) {
      setShowPreview(false);
    }
  }, [isRecording, showCountdown, hidePreviewAfterCountdown, previewManuallyToggled]);

  // Ensure the countdown preview is vertically centered when shown
  useEffect(() => {
    if (showCountdown && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showCountdown]);

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
    if (
      triggerCountdownSignal &&
      !isRecording &&
      !recordingCompleted &&
      webcamInitialized &&
      stream
    ) {
      setShowCountdown(true);
    }
  }, [triggerCountdownSignal, webcamInitialized, stream, isRecording, recordingCompleted]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isRecording || isUploading || isCompressing) {
        // Added isCompressing
        event.preventDefault();
        event.returnValue = 'Your video is still being processed. Are you sure you want to leave?';
      }
    };

    if (isRecording || isUploading || isCompressing) {
      // Added isCompressing
      window.addEventListener('beforeunload', handleBeforeUnload);
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRecording, isUploading, isCompressing]); // Added isCompressing

  const handleRetryWebcam = () => {
    setWebcamInitialized(false);
    setPermissionError(undefined);
    onWebcamError?.(null);
    setRetryMessage('');
    onStatusUpdate?.(null);
  };

  const handleCancel = async () => {
    if (isRecording) {
      // Check if it was recording before cancelling
      onRecordingStatusChange?.(false); // <<< ADD THIS
    }
    if (isCompressing) {
      const ffmpeg = ffmpegRef.current;
      if (ffmpeg.loaded) {
        await ffmpeg.terminate();
        ffmpegRef.current = new FFmpeg();
      }
      setIsCompressing(false);
      setCompressionProgress(0);
    }
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
        <p>
          Your browser does not support webcam recording. Please try on another device or browser.
        </p>
        <button onClick={onCancel} className="btn btn-outline mt-2">
          Go Back
        </button>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="text-center text-red-600">
        <p>{permissionError}</p>
        <div className="mt-4 space-x-2">
          <button onClick={handleRetryWebcam} className="btn btn-primary">
            Retry
          </button>
          <button onClick={handleCancel} className="btn btn-outline">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {' '}
      {/* Use a fragment if adding the overlay as a sibling to the main div */}
      <div
        ref={containerRef}
        className={classNames(
          'relative flex flex-col items-center justify-center text-center',
          className || ''
        )}
      >
        {!(showCountdown || isRecording || recordingCompleted || isCompressing) && (
          <h2 className="mb-1 text-lg font-semibold">Record Your Lyve Reaction</h2>
        )}

        {((showCountdown && !previewManuallyToggled) || showPreview) && (
          <div className="aspect-video relative mb-3 mt-1 w-full max-w-md">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full rounded object-cover shadow-md"
            />

            {showCountdown && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl font-bold text-white drop-shadow-md">{countdownValue}</div>
              </div>
            )}

            {isRecording && !isCompressing && !isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30 text-red-500">
                <svg
                  className="mb-2 h-8 w-8 text-red-500 opacity-75"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                </svg>
                {/* Recording Timer Text */}
                <p className="text-lg font-semibold">
                  {`${Math.round(recorderDuration / 1000)}s of ${maxDuration / 1000}s`}
                </p>
              </div>
            )}
          </div>
        )}

        {recordingCompleted && !isCompressing && !isUploading && (
          <p className="mt-2 text-green-600">Recording complete!</p>
        )}

        {isRecording && (
          <Button
            variant="outline"
            leftIcon={
              showPreview ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )
            }
            onClick={() => {
              setShowPreview(prev => !prev);
              setPreviewManuallyToggled(true);
            }}
            className="mt-1"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        )}

        {isUploading && !hideUploadSpinner && !isCompressing && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          </div>
        )}
      </div>
      {/* NEW Full-Screen Compression Overlay */}
      {isCompressing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-8 border-neutral-300 border-t-primary-600"></div>
          <p className="text-xl font-semibold text-white">Compressing Video...</p>
          <p className="text-md mb-2 text-neutral-200">Please wait a moment.</p>
          <div className="h-2.5 w-3/4 max-w-xs rounded-full bg-neutral-600 sm:max-w-sm md:max-w-md">
            <div
              className="h-2.5 rounded-full bg-primary-500 transition-all duration-150"
              style={{
                width: `${Math.max(0, Math.min(100, Math.round(compressionProgress * 100)))}%`,
              }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-neutral-100">
            {Math.max(0, Math.min(100, Math.round(compressionProgress * 100)))}%
          </p>
        </div>
      )}
    </>
  );
};

export default WebcamRecorder;
