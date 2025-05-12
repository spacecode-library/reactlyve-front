// import { useState, useEffect, useCallback, useRef } from 'react';

// interface UseWebcamOptions {
//   facingMode?: 'user' | 'environment';
//   width?: number;
//   height?: number;
//   audio?: boolean;
// }

// interface UseWebcamReturn {
//   stream: MediaStream | null;
//   videoRef: React.RefObject<HTMLVideoElement>;
//   isLoading: boolean;
//   error: Error | null;
//   startWebcam: () => Promise<void>;
//   stopWebcam: () => void;
//   permissionState: PermissionState | null;
// }

// const useWebcam = (options: UseWebcamOptions = {}): UseWebcamReturn => {
//   const {
//     facingMode = 'user',
//     width = 1280,
//     height = 720,
//     audio = true,
//   } = options;

//   const [stream, setStream] = useState<MediaStream | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<Error | null>(null);
//   const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
//   const videoRef = useRef<HTMLVideoElement>(null) as React.RefObject<HTMLVideoElement>;

//   const checkPermission = useCallback(async () => {
//     try {
//       if (navigator.permissions && navigator.permissions.query) {
//         const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
//         const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
//         setPermissionState(cameraPermission.state === 'granted' && micPermission.state === 'granted' ? 'granted' : cameraPermission.state);
        
//         cameraPermission.addEventListener('change', () => {
//           setPermissionState(cameraPermission.state);
//         });
//         micPermission.addEventListener('change', () => {
//           setPermissionState(micPermission.state);
//         });
//       }
//     } catch (err) {
//       console.error('Error checking permissions:', err);
//     }
//   }, []);

//   useEffect(() => {
//     checkPermission();
//     return () => {
//       if (stream) {
//         stopWebcam();
//       }
//     };
//   }, [checkPermission, stream]);


// const startWebcam = useCallback(async () => {
//   setIsLoading(true);
//   setError(null);
  
//   // 1) loosen or remove width/height
// const constraints = {
//   video: true,    // just “give me whatever camera you have”
//   audio: true
// };
//   async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
//   let timeout: ReturnType<typeof setTimeout>;
//   const timer = new Promise<never>((_, rej) => {
//     timeout = setTimeout(() => rej(new Error('Operation timed out')), ms);
//   });
//   const result = await Promise.race([promise, timer]);
//   clearTimeout(timeout!);
//   return result as T;
// }

// // then:
// await withTimeout(navigator.mediaDevices.getUserMedia(constraints), 10000);

//   let mediaStream: MediaStream;
//   try {
//     mediaStream = await withTimeout(
//       navigator.mediaDevices.getUserMedia(constraints),
//       10000
//     );
//     setStream(mediaStream);
//         await checkPermission();

//   } catch (gumErr) {
//     setError(new Error('Could not access camera: ' + gumErr.message));
//     throw gumErr;
//   }

//   if (!videoRef.current) {
//     console.warn('videoRef missing, skipping playback');
//     setIsLoading(false);
//     return;
//   }

//   videoRef.current.srcObject = mediaStream;

//   try {
//     // 2) wait metadata, with its own timeout
//     await withTimeout(
//       new Promise<void>(res => videoRef.current!.onloadedmetadata = res),
//       5000
//     );
//   } catch (metaErr) {
//     console.warn('metadata load timed out:', metaErr);
//     // we can still try to play even if metadata didn’t fire
//   }

//   try {
//     // 3) play, with catch for AbortError
//     await videoRef.current.play();
//   } catch (playErr) {
//     console.error('Playback failed:', playErr);
//     // you can choose to swallow or rethrow
//     // e.g. setError(new Error('Unable to start video preview'));
//   }

//   await checkPermission();
//   setIsLoading(false);
// }, [facingMode, audio, checkPermission]);

//   const stopWebcam = useCallback(() => {
//     if (stream) {
//       stream.getTracks().forEach(track => track.stop());
//       setStream(null);
      
//       if (videoRef.current) {
//         videoRef.current.srcObject = null;
//         videoRef.current.pause(); // Explicitly pause to avoid play() conflicts
//       }
//     }
//   }, [stream]);

//   return {
//     stream,
//     videoRef,
//     isLoading,
//     error,
//     startWebcam,
//     stopWebcam,
//     permissionState,
//   };
// };

// export default useWebcam;

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

  async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    let timeout: ReturnType<typeof setTimeout>;
    const timer = new Promise<never>((_, rej) => {
      timeout = setTimeout(() => rej(new Error('Operation timed out')), ms);
    });
    const result = await Promise.race([promise, timer]);
    clearTimeout(timeout!);
    return result as T;
  }

  const startWebcam = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Simplified constraints to improve compatibility
    const constraints = {
      video: {
        facingMode: facingMode,
        // Removed fixed width/height to improve compatibility
      },
      audio: audio
    };

    let mediaStream: MediaStream;
    try {
      mediaStream = await withTimeout(
        navigator.mediaDevices.getUserMedia(constraints),
        10000
      );
      setStream(mediaStream);
      await checkPermission();
    } catch (gumErr) {
      setError(new Error('Could not access camera: ' + gumErr));
      setIsLoading(false);
      throw gumErr;
    }

    if (!videoRef.current) {
      console.warn('videoRef missing, skipping playback');
      setIsLoading(false);
      return;
    }

    videoRef.current.srcObject = mediaStream;

    try {
      // Add event listener for when video can play
      await new Promise<void>((resolve) => {
        if (!videoRef.current) {
          resolve();
          return;
        }
        
        // If metadata is already loaded, we can proceed
        if (videoRef.current.readyState >= 1) {
          resolve();
          return;
        }
        
        // Otherwise wait for metadata to load
        videoRef.current.onloadedmetadata = () => resolve();
      });
      
      // Only try to play if video element exists and is ready
      if (videoRef.current) {
        try {
          // Use a promise to handle play
          await videoRef.current.play().catch(playErr => {
            console.warn('Playback failed, likely due to browser autoplay policy:', playErr);
            // Don't treat this as fatal, the user can start playback manually
          });
        } catch (playErr) {
          console.warn('Play attempt failed:', playErr);
          // Continue anyway - this is not a fatal error
        }
      }
    } catch (err) {
      console.warn('Error during video setup:', err);
      // Continue anyway - the stream is still set up correctly
    }

    await checkPermission();
    setIsLoading(false);
  }, [facingMode, audio, checkPermission]);

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.pause();
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

