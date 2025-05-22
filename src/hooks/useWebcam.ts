import { useState, useEffect, useCallback, useRef } from 'react';

interface UseWebcamOptions {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
  audio?: boolean;
}

interface UseWebcamReturn {
  stream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  isLoading: boolean;
  error: Error | null;
  startWebcam: () => Promise<void>;
  stopWebcam: () => void;
  permissionState: PermissionState | null;
}

const useWebcam = (options: UseWebcamOptions = {}): UseWebcamReturn => {
  const {
    facingMode = 'user',
    width = 1280,
    height = 720,
    audio = true,
  } = options;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const checkPermission = useCallback(async () => {
    try {
      if (navigator.permissions?.query) {
        const cam = await navigator.permissions.query({ name: 'camera' as PermissionName });
        const mic = await navigator.permissions.query({ name: 'microphone' as PermissionName });

        setPermissionState(
          cam.state === 'granted' && mic.state === 'granted' ? 'granted' : cam.state
        );

        cam.addEventListener('change', () => setPermissionState(cam.state));
        mic.addEventListener('change', () => setPermissionState(mic.state));
      }
    } catch (err) {
      console.warn('Permission check failed:', err);
    }
  }, []);

  useEffect(() => {
    checkPermission();
    return () => {
      stopWebcam();
    };
  }, [checkPermission]);

  const withTimeout = async <T>(promise: Promise<T>, ms: number): Promise<T> => {
    let timeout: ReturnType<typeof setTimeout>;
    const timer = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error('Operation timed out')), ms);
    });
    const result = await Promise.race([promise, timer]);
    clearTimeout(timeout);
    return result as T;
  };

  const startWebcam = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const constraints = {
      video: {
        facingMode,
        width,
        height,
      },
      audio,
    };

    try {
      const mediaStream = await withTimeout(
        navigator.mediaDevices.getUserMedia(constraints),
        10000
      );
      setStream(mediaStream);
      await checkPermission();

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        await new Promise<void>((resolve) => {
          const ref = videoRef.current;
          if (!ref) return resolve();

          if (typeof ref.readyState === 'number' && ref.readyState >= 1) {
            resolve();
          } else {
            ref.onloadedmetadata = () => resolve();
          }
        });

        try {
          await videoRef.current.play().catch((err) => {
            console.warn('Autoplay blocked or playback failed:', err);
          });
        } catch (err) {
          console.warn('Video play() failed:', err);
        }
      }
    } catch (err) {
      setError(new Error('Could not access webcam: ' + err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, width, height, audio, checkPermission]);

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      try {
        videoRef.current.pause();
      } catch {
        // no-op
      }
    }
  }, [stream]);

  return {
    stream,
    videoRef,
    isLoading,
    error,
    startWebcam,
    stopWebcam,
    permissionState,
  };
};

export default useWebcam;
