import { useState, useCallback, useRef, useEffect } from 'react';

interface UseMediaRecorderOptions {
  stream: MediaStream | null;
  mimeType?: string;
  timeSlice?: number;
  maxDuration?: number;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
}

type RecordingStatus = 'inactive' | 'recording' | 'paused' | 'stopped' | 'error';

const useMediaRecorder = ({
  stream,
  mimeType = 'video/webm',
  timeSlice = 1000,
  maxDuration = 30000,
  audioBitsPerSecond = 128000,
  videoBitsPerSecond = 2500000,
}: UseMediaRecorderOptions) => {
  const [status, setStatus] = useState<RecordingStatus>('inactive');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [isDurationLimitReached, setIsDurationLimitReached] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const durationInterval = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  const getSupportedMimeType = useCallback(() => {
    if (MediaRecorder.isTypeSupported(mimeType)) return mimeType;

    const fallbacks = ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    return fallbacks.find(type => MediaRecorder.isTypeSupported(type)) || '';
  }, [mimeType]);

  const updateDuration = useCallback(() => {
    if (!startTime.current) return;

    const elapsed = Date.now() - startTime.current;
    setDuration(elapsed);

    if (maxDuration && elapsed >= maxDuration) {
      stopRecording();
      setIsDurationLimitReached(true);
    }
  }, [maxDuration]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }

    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!stream) {
      setError(new Error('Stream not available'));
      return;
    }

    try {
      const type = getSupportedMimeType();
      if (!type) throw new Error('No supported mime type for recording.');

      const recorder = new MediaRecorder(stream, {
        mimeType: type,
        audioBitsPerSecond,
        videoBitsPerSecond,
      });

      chunksRef.current = [];
      setRecordedBlob(null);
      setError(null);
      setStatus('recording');
      setIsDurationLimitReached(false);
      startTime.current = Date.now();

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        try {
          const blob = new Blob(chunksRef.current, { type });
          setRecordedBlob(blob);
          setStatus('stopped');
        } catch (err) {
          setError(new Error('Error creating blob'));
          setStatus('error');
        }
      };

      recorder.onerror = (e: any) => {
        setError(new Error(e?.error?.message || 'Recording error'));
        setStatus('error');
      };

      mediaRecorderRef.current = recorder;
      recorder.start(timeSlice);

      durationInterval.current = window.setInterval(() => {
        updateDuration();
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown recording error'));
      setStatus('error');
    }
  }, [stream, getSupportedMimeType, timeSlice, updateDuration, audioBitsPerSecond, videoBitsPerSecond]);

  const clearRecording = useCallback(() => {
    chunksRef.current = [];
    setRecordedBlob(null);
    setDuration(0);
    setIsDurationLimitReached(false);
    setStatus('inactive');
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      stopRecording();
      clearRecording();
    };
  }, [stopRecording, clearRecording]);

  return {
    status,
    recordedBlob,
    duration,
    error,
    startRecording,
    stopRecording,
    clearRecording,
    isDurationLimitReached,
  };
};

export default useMediaRecorder;
