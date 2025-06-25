import { FFmpeg, FileData } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, Check, AlertTriangle } from 'lucide-react';
import { classNames } from '../../utils/classNames';

interface MediaUploaderProps {
  onMediaSelect: (file: File | null) => void;
  onError: (message: string) => void;
  maxSizeMB?: number;
  disabled?: boolean; // Add this line
}

const FFMPEG_CORE_BASE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
const COMPRESSION_THRESHOLD_BYTES = 20 * 1024 * 1024; // 20MB

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onMediaSelect,
  onError,
  maxSizeMB = 100, // Default max size is 100MB
  disabled = false, // Add this and default to false
}) => {
  const ffmpegRef = useRef(new FFmpeg());
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressionProgress, setCompressionProgress] = useState<number>(0);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFFmpegReady, setIsFFmpegReady] = useState<boolean>(false);
  const [ffmpegLoadError, setFfmpegLoadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert MB to bytes
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  useEffect(() => {
    const ffmpegInstance = ffmpegRef.current;
    return () => {
      if (ffmpegInstance && ffmpegInstance.loaded) {
        ffmpegInstance.terminate();
        setIsFFmpegReady(false); // Reset ready state
      }
    };
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount

  const loadFFmpeg = useCallback(async () => {
    setFfmpegLoadError(null);
    if (ffmpegRef.current && ffmpegRef.current.loaded) {
      setIsFFmpegReady(true);
      return true;
    }
    try {
      ffmpegRef.current = new FFmpeg(); // Ensure a fresh instance if not already loaded or if previous load failed
      const ffmpeg = ffmpegRef.current;
      const coreURL = await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm');
      await ffmpeg.load({ coreURL, wasmURL });
      setIsFFmpegReady(true);
      // Setup listeners once after successful load
      ffmpeg.on('progress', ({ progress }) => {
        setCompressionProgress(progress < 0 ? 0 : progress > 1 ? 1 : progress);
      });
      ffmpeg.on('log', (_logEntry) => {
        // Potentially handle specific log messages if needed for non-error states
        // For now, we are removing the console.error for FFmpeg internal logs.
        // if (typeof logEntry.message === 'string' && logEntry.message.toLowerCase().includes('error')) {
        //     console.error(`FFmpeg Error Log: ${logEntry.message}`);
        // }
      });
      return true;
    } catch (error) {
      console.error('Failed to load FFmpeg (loadFFmpeg):', error);
      setFfmpegLoadError('Failed to load FFmpeg. Video compression will not be available.');
      setIsFFmpegReady(false);
      return false;
    }
  }, []);


  const checkVideoMetadata = async (
    f: File
  ): Promise<'ok' | 'duration' | 'error'> => {
    return new Promise(resolve => {
      const videoEl = document.createElement('video');
      videoEl.preload = 'metadata';
      const url = URL.createObjectURL(f);
      videoEl.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        // Metadata successfully loaded
        if (videoEl.duration > 30) {
          onError('Video duration cannot exceed 30 seconds.');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setSelectedMedia(null);
          setPreview(null);
          setIsVideo(false);
          onMediaSelect(null);
          resolve('duration');
        } else {
          resolve('ok');
        }
      };
      videoEl.onerror = () => {
        URL.revokeObjectURL(url);
        // Failed to load metadata
        resolve('error');
      };
      videoEl.src = url;
    });
  };

  const convertWithFFmpeg = async (videoFile: File): Promise<File> => {
    if (preview) URL.revokeObjectURL(preview);
    setIsCompressing(true);
    setCompressionProgress(0);
    setSelectedMedia(videoFile);
    const tempPreview = URL.createObjectURL(videoFile);
    setPreview(tempPreview);
    setIsVideo(true);
    try {
      const ffmpegLoaded = await loadFFmpeg();
      if (!ffmpegLoaded || !ffmpegRef.current || !ffmpegRef.current.loaded) {
        throw new Error('FFmpeg not ready');
      }
      const ffmpeg = ffmpegRef.current;
      const safeInputFileName = 'input.' + videoFile.name.split('.').pop();
      const outputFileName = safeInputFileName.replace(/\.[^/.]+$/, '') + '_converted.mp4';
      await ffmpeg.writeFile(safeInputFileName, await fetchFile(videoFile));
      const ffmpegCommand = [
        '-i',
        safeInputFileName,
        '-vf',
        "scale='if(gt(iw,ih),1280,-2)':'if(gt(iw,ih),-2,1280)'",
        '-c:v',
        'libx264',
        '-crf',
        '28',
        '-preset',
        'ultrafast',
        '-movflags',
        '+faststart',
        '-loglevel',
        'error',
        outputFileName,
      ];
      await ffmpeg.exec(ffmpegCommand);

      const fileData: FileData = await ffmpeg.readFile(outputFileName);

      if (!(fileData instanceof Uint8Array)) {
        throw new Error('Invalid FFmpeg output');
      }

      const processedFile = new File([fileData], videoFile.name.replace(/\.[^/.]+$/, '_c.mp4'), { type: 'video/mp4' });

      if (ffmpeg && ffmpeg.loaded) {
        try {
          await ffmpeg.deleteFile(safeInputFileName);
          await ffmpeg.deleteFile(outputFileName);
        } catch {
          /* ignore */
        }
      }

      URL.revokeObjectURL(tempPreview);
      const processedPreview = URL.createObjectURL(processedFile);
      setPreview(processedPreview);
      setSelectedMedia(processedFile);
      onMediaSelect(processedFile);
      setIsVideo(true);
      return processedFile;
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  const handleMediaSelect = useCallback(async (file: File | null) => {
    if (!file) {
      if (preview) URL.revokeObjectURL(preview);
      setSelectedMedia(null);
      setPreview(null);
      setIsVideo(false);
      onMediaSelect(null);
      return;
    }

    if (file.size > maxSizeBytes) {
      onError(`File size exceeds the ${maxSizeMB}MB limit`);
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const videoExtensions = ['mov', 'mkv', 'avi', 'mp4', 'webm', 'hvec', 'hevc'];
    const imageExtensions = ['heic', 'heif', 'heics', 'heifs'];

    const isVideoFile =
      file.type.startsWith('video/') || videoExtensions.includes(ext);
    const isImageFile =
      file.type.startsWith('image/') || imageExtensions.includes(ext);

    if (!isVideoFile && !isImageFile) {
      onError('Only image or video files are allowed');
      return;
    }

    if (!isVideoFile) {
      if (preview) URL.revokeObjectURL(preview);
      setIsVideo(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedMedia(file);
      onMediaSelect(file);
      return;
    }

    let processedFile = file;
    let meta = await checkVideoMetadata(processedFile);
    if (meta === 'duration') {
      return;
    }
    if (meta === 'error') {
      try {
        processedFile = await convertWithFFmpeg(processedFile);
      } catch {
        onError('Could not read video metadata.');
        return;
      }
      meta = await checkVideoMetadata(processedFile);
      if (meta !== 'ok') {
        onError('Could not read video metadata.');
        return;
      }
    }

    if (processedFile.size > COMPRESSION_THRESHOLD_BYTES && processedFile === file) {
      try {
        processedFile = await convertWithFFmpeg(processedFile);
      } catch {
        return;
      }
      // convertWithFFmpeg already sets preview and selected file
    } else if (processedFile === file) {
      if (preview) URL.revokeObjectURL(preview);
      const directPreviewUrl = URL.createObjectURL(processedFile);
      setPreview(directPreviewUrl);
      setSelectedMedia(processedFile);
      onMediaSelect(processedFile);
      setIsVideo(true);
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  }, [maxSizeBytes, maxSizeMB, onError, onMediaSelect, preview, loadFFmpeg]);
  
  const handleBrowseClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleMediaSelect(file);
  }, [handleMediaSelect]);

  const handleRemove = useCallback(async () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    const ffmpeg = ffmpegRef.current;
    if (isCompressing && ffmpeg && ffmpeg.loaded) { // Check ffmpeg.loaded
      await ffmpeg.terminate();
      ffmpegRef.current = new FFmpeg(); // Create a new instance for next time
      setIsFFmpegReady(false); // Mark as not ready
    }
    setIsCompressing(false);
    setCompressionProgress(0);
    setSelectedMedia(null);
    setPreview(null);
    setIsVideo(false);
    onMediaSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [isCompressing, onMediaSelect, preview]); // Added isCompressing and preview

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0] || null;
    handleMediaSelect(file);
  }, [handleMediaSelect]);
  
  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,video/*,.mov,.mkv,.avi,.heic,.heif,.hvec,.hevc"
        className="hidden"
        name="media"
        disabled={disabled}
      />

      {ffmpegLoadError && (
        <div className="mb-4 flex items-center rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
          <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0" />
          {ffmpegLoadError}
        </div>
      )}

      {isCompressing ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-6 dark:border-neutral-700">
          <p className="mb-2 text-lg font-medium text-neutral-700 dark:text-neutral-300">
            Compressing video...
          </p>
          {selectedMedia && (
             <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400 truncate max-w-xs">
               {selectedMedia.name}
             </p>
          )}
          <div className="w-full bg-neutral-200 rounded-full h-2.5 dark:bg-neutral-700 my-2">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-150"
              style={{ width: `${Math.max(0, Math.min(100, Math.round(compressionProgress * 100)))}%` }}
            ></div>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {Math.max(0, Math.min(100, Math.round(compressionProgress * 100)))}%
          </p>
        </div>
      ) : !selectedMedia ? (
        <div
          className={classNames(
            'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
            disabled
              ? 'border-neutral-300 bg-neutral-100 opacity-50 cursor-not-allowed dark:border-neutral-700 dark:bg-neutral-800'
              : isDragging
                ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-neutral-800'
                : 'border-neutral-300 hover:border-primary-400 dark:border-neutral-700 dark:hover:border-primary-600'
          )}
          onClick={disabled ? undefined : handleBrowseClick}
          onDragEnter={disabled ? undefined : handleDragEnter}
          onDragLeave={disabled ? undefined : handleDragLeave}
          onDragOver={disabled ? undefined : handleDragOver}
          onDrop={disabled ? undefined : handleDrop}
          role={disabled ? undefined : "button"}
          tabIndex={disabled ? -1 : 0}
        >
          <Upload
            className="mb-3 h-10 w-10 text-neutral-400 dark:text-neutral-500"
            aria-hidden="true"
          />
          <p className="mb-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Drag and drop your media here, or{' '}
            <span className="text-primary-600 dark:text-primary-400">browse</span>
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Supports images and videos up to {maxSizeMB}MB
          </p>
        </div>
      ) : (
        // Selected media display UI (existing code, with minor adjustment for status text)
        <div className="relative rounded-lg border border-neutral-300 p-2 dark:border-neutral-700">
          <div className="flex items-center space-x-3">
            {preview && (
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
                {isVideo ? (
                  <video src={preview} className="h-full w-full object-cover" />
                ) : (
                  <img src={preview} alt="Media preview" className="h-full w-full object-cover" />
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {selectedMedia.name}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isVideo ? 'Video' : 'Image'} · {(selectedMedia.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <div className="mt-1 flex items-center">
                <Check className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">
                  {isVideo && selectedMedia.name.includes('_c.') ? 'Compressed & ready' : 'Ready to upload'}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-neutral-100 p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-400"
            disabled={isCompressing || disabled}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Remove</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
