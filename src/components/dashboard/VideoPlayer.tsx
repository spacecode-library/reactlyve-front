import React, { useState, useRef, useEffect, useCallback } from 'react';
import { formatDuration } from '../../utils/formatters';
import { classNames } from '../../utils/classNames';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  onError?: (error: Error) => void;
  autoPlay?: boolean;
  loop?: boolean;
  controls?: boolean;
  muted?: boolean;
}

const PLAYBACK_SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  className,
  onError,
  autoPlay = false,
  loop = false,
  controls = true,
  muted = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentPlaybackRate, setCurrentPlaybackRate] = useState(1.0);
  const [isPipActive, setIsPipActive] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false); // State for "More Options" menu
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const toggleMoreMenu = () => setIsMoreMenuOpen(prev => !prev);
  
  // Function to load metadata when video loads
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration * 1000);
      setIsLoading(false);
    }
  }, []);
  
  // Function to update current time during playback
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime * 1000);
    }
  }, []);
  
  // Function to handle playback ending
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (loop && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [loop]);
  
  // Function to handle video errors
  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    if (onError) {
      onError(new Error('Failed to load video'));
    }
  }, [onError]);
  
  // Function to toggle play/pause
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);
  
  // Function to toggle mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);
  
  // Function to seek to a specific position
  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const position = (e.clientX - rect.left) / rect.width;
      const seekTime = position * videoRef.current.duration;
      
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime * 1000);
    }
  }, []);
  
  // Function to change volume
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  }, []);
  
  // Function to toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;
    
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  }, []);

  // Function to change playback speed
  const changePlaybackSpeed = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setCurrentPlaybackRate(rate);
    }
  }, []);

  // Function to toggle Picture-in-Picture mode
  const togglePictureInPicture = useCallback(async () => {
    if (!videoRef.current) return;

    if (!document.pictureInPictureEnabled || videoRef.current.disablePictureInPicture) {
      console.warn('Picture-in-Picture is not supported or is disabled for this video.');
      return;
    }

    try {
      if (document.pictureInPictureElement === videoRef.current) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Error toggling Picture-in-Picture mode:', error);
    }
  }, []);
  
  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle Picture-in-Picture mode changes
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleEnterPip = () => setIsPipActive(true);
    const handleLeavePip = () => setIsPipActive(false);

    videoElement.addEventListener('enterpictureinpicture', handleEnterPip);
    videoElement.addEventListener('leavepictureinpicture', handleLeavePip);

    // Check initial PiP state
    if (document.pictureInPictureElement === videoElement) {
      setIsPipActive(true);
    }

    return () => {
      videoElement.removeEventListener('enterpictureinpicture', handleEnterPip);
      videoElement.removeEventListener('leavepictureinpicture', handleLeavePip);
    };
  }, []); 
  
  // Set up event listeners on mount and clean up on unmount
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (videoElement) {
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      videoElement.addEventListener('ended', handleEnded);
      videoElement.addEventListener('error', handleError);
      
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('ended', handleEnded);
        videoElement.removeEventListener('error', handleError);
      };
    }
  }, [handleLoadedMetadata, handleTimeUpdate, handleEnded, handleError]);
  
  // Show/hide controls based on mouse movement
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const pipSupported = !!(typeof document !== 'undefined' && document.pictureInPictureEnabled && videoRef.current && !videoRef.current.disablePictureInPicture);
  
  return (
    <div
      className={classNames(
        'group relative overflow-hidden rounded-lg bg-black',
        className || ''
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full"
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        onClick={togglePlay}
      />
      
      {/* Title overlay (if provided) */}
      {title && (
        <div className="absolute left-0 right-0 top-0 bg-gradient-to-b from-black/70 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}
      
      {/* Loading spinner */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      )}
      
      {/* Error message */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-2 text-lg font-medium text-white">Failed to load video</p>
          <p className="text-sm text-neutral-300">
            The video might be corrupted or no longer available.
          </p>
        </div>
      )}
      
      {/* Play/Pause button overlay */}
      {!isLoading && !hasError && (
        <button
          type="button"
          className={classNames(
            'absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity',
            isPlaying ? 'opacity-0' : 'opacity-100'
          )}
          onClick={togglePlay}
        >
          {isPlaying ? (
            <span className="sr-only">Pause</span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      )}
      
      {/* Video controls */}
      {controls && !hasError && (
        <div
          className={classNames(
            'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300',
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Controls row */}
          <div className="mb-2 flex items-center justify-between relative"> {/* Added relative for menu positioning */}
            {/* Time display */}
            <div className="text-sm text-white">
              <span>{formatDuration(currentTime)}</span>
              <span className="mx-1">/</span>
              <span>{formatDuration(duration)}</span>
            </div>
            
            {/* Group of controls (Volume, Fullscreen, More Options) */}
            <div className="flex items-center space-x-2">
              {/* Volume control */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="rounded-full p-1 text-white hover:bg-white/20"
                >
                  {isMuted || volume === 0 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.75.75v3.5c0 .414.336.75.75.75h1.536l4.033 3.796A.75.75 0 0010 15.25V3.75zM9 13.506L6.251 11H4v-3h2.251L9 5.494v8.012zm3.707-7.027a.75.75 0 00-1.061 1.06 3.5 3.5 0 010 4.95.75.75 0 101.06 1.06 5 5 0 000-7.07z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd"/>
                    </svg>
                  )}
                </button>
                <div className="relative w-16 overflow-hidden transition-all duration-200 group-hover:w-16 md:w-0">
                  <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="h-1.5 w-full appearance-none rounded-lg bg-neutral-600 accent-primary-500"/>
                </div>
              </div>
              
              {/* Fullscreen button */}
              <button type="button" onClick={toggleFullscreen} className="rounded-full p-1 text-white hover:bg-white/20">
                {isFullscreen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5zm0 2h4v4H5V6zm0 6h4v4H5v-4zm6-6h4v4h-4V6zm0 6h4v4h-4v-4z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd"/>
                  </svg>
                )}
              </button>

              {/* More Options Button */}
              <button type="button" onClick={toggleMoreMenu} className="rounded-full p-1 text-white hover:bg-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
            </div>
            {/* More Options Menu */}
            {isMoreMenuOpen && (
              <div className="absolute bottom-full right-0 mb-2 bg-neutral-800 rounded-md shadow-lg p-2 z-20 min-w-[150px]">
                <div className="text-sm text-neutral-400 px-2 py-1">Speed</div>
                {PLAYBACK_SPEED_OPTIONS.map(rate => (
                  <button
                    key={rate}
                    onClick={() => {
                      changePlaybackSpeed(rate);
                      setIsMoreMenuOpen(false);
                    }}
                    className={classNames(
                      'w-full text-left px-2 py-1 text-sm rounded hover:bg-neutral-700',
                      rate === currentPlaybackRate ? 'text-primary-400 font-semibold' : 'text-white'
                    )}
                  >
                    {rate === 1.0 ? 'Normal' : `${rate}x`}
                  </button>
                ))}
                {pipSupported && (
                  <>
                    <div className="border-t border-neutral-700 my-1"></div> {/* Divider */}
                    <button
                      onClick={() => {
                        togglePictureInPicture();
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full text-left px-2 py-1 text-sm text-white rounded hover:bg-neutral-700"
                    >
                      {isPipActive ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="relative h-1 cursor-pointer rounded-full bg-neutral-600"
            onClick={handleSeek}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary-500"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;