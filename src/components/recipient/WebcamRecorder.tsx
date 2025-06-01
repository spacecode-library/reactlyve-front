import { FFmpeg, FileData } from '@ffmpeg/ffmpeg'; // Added
import { fetchFile, toBlobURL } from '@ffmpeg/util'; // Added
import React, { useState, useEffect, useRef } from 'react'; // Added useRef
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
}) => {
  const ffmpegRef = useRef(new FFmpeg()); // Added
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
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('log', (logEntry) => {
      // console.log(`FFmpeg internal log (WebcamRecorder): ${logEntry.message}`);
      if (typeof logEntry.message === 'string' && logEntry.message.toLowerCase().includes('error')) {
          console.error(`FFmpeg Error Log (WebcamRecorder): ${logEntry.message}`);
      }
    });

    const loadFFmpeg = async () => {
      if (!ffmpeg.loaded) {
        try {
          const coreURL = await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`, 'text/javascript');
          const wasmURL = await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm');
          // console.log('Loading FFmpeg core (WebcamRecorder)...');
          await ffmpeg.load({ coreURL, wasmURL });
          // console.log('FFmpeg core loaded (WebcamRecorder).');
        } catch (err) {
          console.error("Failed to load FFmpeg core (WebcamRecorder):", err);
          onWebcamError?.("Failed to load video compression components.");
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
    const processAndCompleteRecording = async (blob: Blob) => {
      let blobToUpload = blob;
      let processingError: Error | null = null;

      // Outer try/finally to ensure webcam is stopped once processing is attempted.
      try {
        if (blob.size > COMPRESSION_THRESHOLD_BYTES && ffmpegRef.current.loaded) {
          setIsCompressing(true);
          onStatusUpdate?.('Compressing video...');
          console.log('[WebcamRecorder] Starting video compression.'); // New Log

          try {
            ffmpegRef.current.on('progress', ({ progress }) => {
              setCompressionProgress(progress < 0 ? 0 : progress > 1 ? 1 : progress);
            });

            const inputFileName = "input.webm";
            const outputFileName = "output_compressed.mp4";

            await ffmpegRef.current.writeFile(inputFileName, await fetchFile(blob));

            const ffmpegCommand = [
              '-i', inputFileName,
              '-vf', "scale='if(gt(iw,ih),1280,-2)':'if(gt(iw,ih),-2,1280)'",
              '-c:v', 'libx264',
              '-crf', '25',
              '-preset', 'ultrafast',
              '-movflags', '+faststart',
              '-loglevel', 'error',
              outputFileName
            ];
            await ffmpegRef.current.exec(ffmpegCommand);

            const data: FileData = await ffmpegRef.current.readFile(outputFileName);
            if (data instanceof Uint8Array && data.length > 0) {
              blobToUpload = new Blob([data.buffer], { type: 'video/mp4' });
            } else {
              console.error('FFmpeg (WebcamRecorder): Compression resulted in a zero-byte or non-Uint8Array file. Using original.');
              onWebcamError?.('Compression failed. Uploading original.');
              blobToUpload = blob; // Ensure original blob is used
            }
            await ffmpegRef.current.deleteFile(inputFileName);
            await ffmpegRef.current.deleteFile(outputFileName);
            console.log('[WebcamRecorder] Video compression finished.'); // New Log
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
            console.warn('[WebcamRecorder] FFmpeg not loaded. Skipping compression.');
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
        console.log('[WebcamRecorder] Calling stopWebcam() in processAndCompleteRecording finally block.'); // New Log
        stopWebcam(); // Ensure webcam is stopped regardless of processing success/failure.
      }

      // Now that webcam is stopped, call the completion callback.
      // This happens outside the try/finally for stopping the webcam.
      if (processingError) {
        // If there was a processing error, onRecordingComplete still needs to be called
        // so the application flow can continue (e.g. upload original, show error message)
        console.log('[WebcamRecorder] Processing error occurred, calling onRecordingComplete with original blob.');
      } else {
        console.log('[WebcamRecorder] Processing complete, calling onRecordingComplete.');
      }
      onRecordingComplete(blobToUpload);
    };

    if (recordingStatus === 'stopped' && recordedBlob && !recordingCompleted) {
      setRecordingCompleted(true);
      setIsRecording(false); // This state indicates UI should hide recording elements

      const runProcessing = async () => {
        await processAndCompleteRecording(recordedBlob);
        // Any other state updates that depend on processing being fully done
      };
      runProcessing();
      // Removed stopWebcam() and videoRef cleanup from here
    }
  }, [recordingStatus, recordedBlob, recordingCompleted, onRecordingComplete, stopWebcam, onWebcamError, onStatusUpdate]);

  // Add this new useEffect for failsafe cleanup:
  useEffect(() => {
    // This effect runs once on mount and returns a cleanup function.
    console.log('[WebcamRecorder] Mount or dependency change, registering cleanup effect.'); // New Log

    return () => {
        console.log('[WebcamRecorder] Unmounting or dependency change, calling stopWebcam from cleanup effect.'); // New Log
        // Call the stopWebcam function from the useWebcam hook.
        // This ensures that if the component unmounts for any reason,
        // an attempt is made to stop the webcam.
        stopWebcam();
    };
  }, [stopWebcam]); // `stopWebcam` is a dependency. It's a stable function from useCallback in useWebcam.



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
    if (isRecording || isUploading || isCompressing) { // Added isCompressing
        event.preventDefault();
        event.returnValue = 'Your video is still being processed. Are you sure you want to leave?';
    }
    };

    if (isRecording || isUploading || isCompressing) { // Added isCompressing
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
    <> {/* Use a fragment if adding the overlay as a sibling to the main div */}
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

      {isRecording && !isCompressing && (
        <p className="text-red-500 mt-2 text-sm font-medium">
          Recording... {recordingCountdown !== null ? `${recordingCountdown}s left` : ''}
        </p>
      )}

      {recordingCompleted && !isCompressing && !isUploading && (
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

      {isUploading && !hideUploadSpinner && !isCompressing && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>

      {/* NEW Full-Screen Compression Overlay */}
      {isCompressing && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
          <div className="h-16 w-16 animate-spin rounded-full border-8 border-neutral-300 border-t-primary-600 mb-4"></div>
          <p className="text-white text-xl font-semibold">Compressing Video...</p>
          <p className="text-neutral-200 text-md mb-2">Please wait a moment.</p>
          <div className="w-3/4 max-w-xs sm:max-w-sm md:max-w-md bg-neutral-600 rounded-full h-2.5">
            <div
              className="bg-primary-500 h-2.5 rounded-full transition-all duration-150"
              style={{ width: `${Math.max(0, Math.min(100, Math.round(compressionProgress * 100)))}%` }}
            ></div>
          </div>
          <p className="text-neutral-100 text-sm mt-2">
            {Math.max(0, Math.min(100, Math.round(compressionProgress * 100)))}%
          </p>
        </div>
      )}
    </>
  );
};

export default WebcamRecorder;
