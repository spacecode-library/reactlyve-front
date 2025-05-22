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
  const durationInterval = useRef<number>();
  const startTime = useRef<number>();

  const getSupportedMimeType = useCallback(() => {
    if (MediaRecorder.isTypeSupported(mimeType)) return mimeType;
    const fallbacks = ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    return fallbacks.find(type => MediaRecorder.isTypeSupported(type)) || '';
  }, [mimeType]);

  const updateDuration = () => {
    if (!startTime.current) return;
    const elapsed = Date.now() - startTime.current;
    setDuration(elapsed);
    if (maxDuration && elapsed >= maxDuration) {
      stopRecording();
      setIsDurationLimitReached(true);
    }
  };

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    clearInterval(durationInterval.current);
  }, []);

  const startRecording = useCallback(() => {
    if (!stream) {
      setError(new Error('Stream not available'));
      return;
    }
    try {
      const type = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, {
        mimeType: type,
        audioBitsPerSecond,
        videoBitsPerSecond,
      });
      chunksRef.current = [];
      setRecordedBlob(null);
      setError(null);
      setStatus('recording');
      startTime.current = Date.now();

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type });
        setRecordedBlob(blob);
        setStatus('stopped');
      };

      recorder.onerror = (e: any) => {
        setError(new Error(e?.error?.message || 'Recording failed'));
        setStatus('error');
      };

      mediaRecorderRef.current = recorder;
      recorder.start(timeSlice);
      durationInterval.current = window.setInterval(updateDuration, 100);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Recording error'));
      setStatus('error');
    }
  }, [stream, getSupportedMimeType]);

  const clearRecording = () => {
    chunksRef.current = [];
    setRecordedBlob(null);
    setDuration(0);
    setIsDurationLimitReached(false);
  };

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
