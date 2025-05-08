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
      // Check if permissions API is supported
      if (navigator.permissions && navigator.permissions.query) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermissionState(cameraPermission.state);
        
        // Listen for permission changes
        cameraPermission.addEventListener('change', () => {
          setPermissionState(cameraPermission.state);
        });
      }
    } catch (err) {
      // Permissions API might not be supported or may fail
      console.error('Error checking camera permission:', err);
    }
  }, []);

  useEffect(() => {
    checkPermission();
    
    // Cleanup
    return () => {
      if (stream) {
        stopWebcam();
      }
    };
  }, [checkPermission]);

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
      
      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
      await checkPermission();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error starting webcam'));
      console.error('Error accessing webcam:', err);
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