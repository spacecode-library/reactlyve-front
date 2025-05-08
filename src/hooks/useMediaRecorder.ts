import { useState, useCallback, useRef, useEffect } from 'react';

interface MediaRecorderOptions {
  stream: MediaStream | null;
  mimeType?: string;
  timeSlice?: number;
  maxDuration?: number; // in milliseconds
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
}

type RecordingStatus = 'inactive' | 'recording' | 'paused' | 'stopped' | 'error';

interface UseMediaRecorderReturn {
  status: RecordingStatus;
  recordedBlob: Blob | null;
  duration: number;
  error: Error | null;
  startRecording: () => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearRecording: () => void;
  isDurationLimitReached: boolean;
}

const useMediaRecorder = ({
  stream,
  mimeType = 'video/webm;codecs=vp9,opus',
  timeSlice = 1000, // 1 second
  maxDuration = 20000, // 20 seconds
  audioBitsPerSecond = 128000,
  videoBitsPerSecond = 2500000,
}: MediaRecorderOptions): UseMediaRecorderReturn => {
  const [status, setStatus] = useState<RecordingStatus>('inactive');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);
  const [isDurationLimitReached, setIsDurationLimitReached] = useState<boolean>(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const durationTimerRef = useRef<number | null>(null);
  const maxDurationTimerRef = useRef<number | null>(null);

  // Check if the specified mimeType is supported
  const getSupportedMimeType = useCallback(() => {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
    
    // Fallback options
    const fallbackTypes = [
      'video/webm',
      'video/webm;codecs=vp8,opus',
      'video/mp4',
    ];
    
    for (const type of fallbackTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    // Last resort fallback
    return '';
  }, [mimeType]);

  // Function to update duration
  const updateDuration = useCallback(() => {
    if (startTimeRef.current) {
      const newDuration = Date.now() - startTimeRef.current;
      setDuration(newDuration);
      
      if (maxDuration && newDuration >= maxDuration) {
        setIsDurationLimitReached(true);
        stopRecording();
      }
    }
  }, [maxDuration]);

  // Setup recorder when stream changes
  useEffect(() => {
    if (!stream) {
      return;
    }
    
    try {
      const supportedType = getSupportedMimeType();
      
      if (!supportedType) {
        throw new Error('No supported mimeType found for MediaRecorder');
      }
      
      const options: MediaRecorderOptions = {
        mimeType: supportedType,
        audioBitsPerSecond,
        videoBitsPerSecond,
      };
      
      const recorder = new MediaRecorder(stream, options);
      
      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        try {
          const blob = new Blob(chunksRef.current, { type: supportedType });
          setRecordedBlob(blob);
          setStatus('stopped');
          
          // Clear duration timer
          if (durationTimerRef.current) {
            clearInterval(durationTimerRef.current);
            durationTimerRef.current = null;
          }
          
          if (maxDurationTimerRef.current) {
            clearTimeout(maxDurationTimerRef.current);
            maxDurationTimerRef.current = null;
          }
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Unknown error processing recording'));
          setStatus('error');
        }
      };
      
      recorder.onerror = (event) => {
        setError(new Error('MediaRecorder error: ' + event.error));
        setStatus('error');
      };
      
      mediaRecorderRef.current = recorder;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error initializing MediaRecorder'));
      setStatus('error');
    }
    
    // Cleanup on unmount or when stream changes
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
      
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
      }
    };
  }, [stream, getSupportedMimeType, audioBitsPerSecond, videoBitsPerSecond, updateDuration, maxDuration]);

  const startRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !stream) {
      setError(new Error('Cannot start recording: MediaRecorder or stream not available'));
      return;
    }
    
    try {
      // Reset state
      chunksRef.current = [];
      setRecordedBlob(null);
      setDuration(0);
      setError(null);
      setIsDurationLimitReached(false);
      
      // Start recording
      mediaRecorderRef.current.start(timeSlice);
      setStatus('recording');
      
      // Start timing
      startTimeRef.current = Date.now();
      
      // Set up duration timer
      durationTimerRef.current = window.setInterval(() => {
        updateDuration();
      }, 100); // Update duration every 100ms for smooth display
      
      // Set up max duration timer
      if (maxDuration) {
        maxDurationTimerRef.current = window.setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            setIsDurationLimitReached(true);
            stopRecording();
          }
        }, maxDuration);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error starting recording'));
      setStatus('error');
    }
  }, [stream, timeSlice, updateDuration, maxDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        
        // Final duration update
        if (startTimeRef.current) {
          setDuration(Date.now() - startTimeRef.current);
        }
        
        // Clear timers
        if (durationTimerRef.current) {
          clearInterval(durationTimerRef.current);
          durationTimerRef.current = null;
        }
        
        if (maxDurationTimerRef.current) {
          clearTimeout(maxDurationTimerRef.current);
          maxDurationTimerRef.current = null;
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error stopping recording'));
        setStatus('error');
      }
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.pause();
        setStatus('paused');
        
        // Pause duration timer
        if (durationTimerRef.current) {
          clearInterval(durationTimerRef.current);
          durationTimerRef.current = null;
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error pausing recording'));
        setStatus('error');
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      try {
        mediaRecorderRef.current.resume();
        setStatus('recording');
        
        // Resume duration timer
        durationTimerRef.current = window.setInterval(() => {
          updateDuration();
        }, 100);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error resuming recording'));
        setStatus('error');
      }
    }
  }, [updateDuration]);

  const clearRecording = useCallback(() => {
    setRecordedBlob(null);
    setDuration(0);
    chunksRef.current = [];
    setIsDurationLimitReached(false);
  }, []);

  return {
    status,
    recordedBlob,
    duration,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    isDurationLimitReached,
  };
};

export default useMediaRecorder;