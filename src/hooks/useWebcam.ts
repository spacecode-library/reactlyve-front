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
  const videoRef = useRef<HTMLVideoElement>(null) as React.RefObject<HTMLVideoElement>;

  const checkPermission = useCallback(async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setPermissionState(cameraPermission.state === 'granted' && micPermission.state === 'granted' ? 'granted' : cameraPermission.state);
        
        cameraPermission.addEventListener('change', () => {
          setPermissionState(cameraPermission.state);
        });
        micPermission.addEventListener('change', () => {
          setPermissionState(micPermission.state);
        });
      }
    } catch (err) {
      console.error('Error checking permissions:', err);
    }
  }, []);

  useEffect(() => {
    checkPermission();
    return () => {
      if (stream) {
        stopWebcam();
      }
    };
  }, [checkPermission, stream]);

  const startWebcam = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
        audio,
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure the video element is not already playing or loading a new stream
        if (videoRef.current.paused) {
          await videoRef.current.play().catch(err => {
            throw new Error(`Failed to play video stream: ${err.message}`);
          });
        }
      }
      
      await checkPermission();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to access webcam/microphone');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, width, height, audio, checkPermission]);

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.pause(); // Explicitly pause to avoid play() conflicts
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