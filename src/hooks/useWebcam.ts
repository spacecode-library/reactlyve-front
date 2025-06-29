import { useState, useEffect, useCallback, useRef } from 'react';

interface UseWebcamOptions {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
  audio?: boolean;
  video?: boolean;
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
  const { facingMode = 'user', width = 1280, height = 720, audio = true, video = true } = options;

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const permissionListenersRef = useRef<{
    cam?: { obj: PermissionStatus; lis: () => void };
    mic?: { obj: PermissionStatus; lis: () => void };
  } | null>(null);

  const checkPermission = useCallback(async () => {
    try {
      if (navigator.permissions?.query) {
        const camPermission = await navigator.permissions.query({
          name: 'camera' as PermissionName,
        });
        const micPermission = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        });

        // Define listener functions
        const updateCombinedPermissionState = () => {
          if (camPermission.state === 'granted' && micPermission.state === 'granted') {
            setPermissionState('granted');
          } else if (camPermission.state === 'denied' || micPermission.state === 'denied') {
            setPermissionState('denied');
          } else {
            setPermissionState('prompt');
          }
        };

        const camListener = () => updateCombinedPermissionState();
        const micListener = () => updateCombinedPermissionState();

        // Remove old listeners before adding new ones
        if (permissionListenersRef.current?.cam) {
          permissionListenersRef.current.cam.obj.removeEventListener(
            'change',
            permissionListenersRef.current.cam.lis
          );
        }
        if (permissionListenersRef.current?.mic) {
          permissionListenersRef.current.mic.obj.removeEventListener(
            'change',
            permissionListenersRef.current.mic.lis
          );
        }

        // Add new listeners
        camPermission.addEventListener('change', camListener);
        micPermission.addEventListener('change', micListener);

        // Store new listeners and permission objects for cleanup and future removals
        permissionListenersRef.current = {
          cam: { obj: camPermission, lis: camListener },
          mic: { obj: micPermission, lis: micListener },
        };

        // Set initial combined state
        updateCombinedPermissionState();
      }
    } catch (err) {
      console.warn('Permission check failed:', err);
      // Optionally set an error state or a specific permission state indicating failure
      setPermissionState(null); // Or 'denied' or some error state
    }
  }, [setPermissionState]); // setPermissionState is stable, but good to list if directly used like this.

  useEffect(() => {
    checkPermission();

    return () => {
      stopWebcam();
      // Remove listeners on cleanup
      if (permissionListenersRef.current?.cam) {
        permissionListenersRef.current.cam.obj.removeEventListener(
          'change',
          permissionListenersRef.current.cam.lis
        );
      }
      if (permissionListenersRef.current?.mic) {
        permissionListenersRef.current.mic.obj.removeEventListener(
          'change',
          permissionListenersRef.current.mic.lis
        );
      }
      permissionListenersRef.current = null;
    };
  }, [checkPermission]);

  const withTimeout = async <T>(promise: Promise<T>, ms: number): Promise<T> => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const timer = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error('Operation timed out')), ms);
    });
    const result = await Promise.race([promise, timer]);
    if (timeout) clearTimeout(timeout);
    return result as T;
  };

  const startWebcam = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const constraints: MediaStreamConstraints = { audio };
    if (video) {
      constraints.video = { facingMode, width, height };
    } else {
      constraints.video = false;
    }

    try {
      const mediaStream = await withTimeout(
        navigator.mediaDevices.getUserMedia(constraints),
        10000
      );
      setStream(mediaStream);
      await checkPermission();

      if (video && videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        await new Promise<void>(resolve => {
          const ref = videoRef.current;
          if (!ref) return resolve();

          if (typeof ref.readyState === 'number' && ref.readyState >= 1) {
            resolve();
          } else {
            ref.onloadedmetadata = () => resolve();
          }
        });

        try {
          await videoRef.current.play().catch(err => {
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
  }, [facingMode, width, height, audio, checkPermission]); // checkPermission is a dependency of startWebcam

  const stopWebcam = useCallback(() => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => {
        track.stop();
      });
      setStream(null);
    }

    if (video && videoRef.current) {
      videoRef.current.srcObject = null;
      try {
        videoRef.current.pause();
      } catch (e) {
        console.warn('[useWebcam] Error pausing videoRef:', e);
      }
    }
  }, [stream, videoRef]);

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
