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


  const handleMediaSelect = useCallback(async (file: File | null) => {
    if (file) {
      // Check file size (original file)
      if (file.size > maxSizeBytes) {
        onError(`File size exceeds the ${maxSizeMB}MB limit`);
        return;
      }

      // Check if file type is an image or video
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        onError('Only image or video files are allowed');
        return;
      }

      const isVideoFile = file.type.startsWith('video/');

      if (isVideoFile) {
        // --- Video Duration Check ---
        const video = document.createElement('video');
        video.preload = 'metadata';
        const videoUrl = URL.createObjectURL(file);

        try {
          await new Promise<void>((resolve, reject) => {
            video.onloadedmetadata = () => {
              URL.revokeObjectURL(videoUrl); // Clean up object URL
              if (video.duration > 30) {
                onError('Video duration cannot exceed 30 seconds.');
                // Clean up selected file state if duration check fails
                setSelectedMedia(null);
                setPreview(null);
                setIsVideo(false);
                onMediaSelect(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''; // Reset file input
                }
                reject(new Error('Video too long'));
              } else {
                resolve();
              }
            };
            video.onerror = () => {
              URL.revokeObjectURL(videoUrl);
              onError('Could not read video metadata.');
              reject(new Error('Error loading video metadata'));
            };
            video.src = videoUrl;
          });
        } catch (error) {
          return; // Stop processing if duration check fails or errors out
        }
        // --- End Video Duration Check ---

        // --- Conditional Compression Logic ---
        if (file.size > COMPRESSION_THRESHOLD_BYTES) {
          setIsCompressing(true);
          setCompressionProgress(0);
          // Show original file info and preview while preparing for compression
          setSelectedMedia(file);
          const originalPreviewUrlWhileCompressing = URL.createObjectURL(file); // Use a distinct name if originalPreviewUrl is used elsewhere
          setPreview(originalPreviewUrlWhileCompressing);
          setIsVideo(true);

          try {
            const ffmpegLoaded = await loadFFmpeg();
            if (!ffmpegLoaded || !ffmpegRef.current || !ffmpegRef.current.loaded) {
              onError(ffmpegLoadError || 'FFmpeg could not be loaded. Cannot compress video.');
              // Revert to original file if FFmpeg fails to load
              if (preview) URL.revokeObjectURL(preview);
              const originalPreviewUrl = URL.createObjectURL(file);
              setPreview(originalPreviewUrl);
              setSelectedMedia(file);
              onMediaSelect(file);
              setIsVideo(true);
              setIsCompressing(false);
              setCompressionProgress(0);
              return;
            }
            const ffmpeg = ffmpegRef.current;

            // Listeners are now set in loadFFmpeg to avoid re-assigning them.
            // ffmpeg.on('progress', ({ progress }) => {
            //   setCompressionProgress(progress < 0 ? 0 : progress > 1 ? 1 : progress);
            // });
            // ffmpeg.on('log', (logEntry) => {
            //   // console.log(`FFmpeg internal log: ${logEntry.message}`);
            //   if (typeof logEntry.message === 'string' && logEntry.message.toLowerCase().includes('error')) {
            //       console.error(`FFmpeg Error Log: ${logEntry.message}`);
            //   }
            // });

            const inputFileName = file.name;
            // Sanitize filename for ffmpeg's virtual FS if necessary, though often not an issue with modern ffmpeg.wasm
          const safeInputFileName = "input." + file.name.split('.').pop(); // e.g., input.mp4
          const outputFileName = safeInputFileName.replace(/\.[^/.]+$/, "") + "_compressed.mp4"; // e.g., input_compressed.mp4

          await ffmpeg.writeFile(safeInputFileName, await fetchFile(file));

          const ffmpegCommand = [
            '-i', safeInputFileName,
            '-vf', "scale='if(gt(iw,ih),1280,-2)':'if(gt(iw,ih),-2,1280)'", // Updated scaling
            '-c:v', 'libx264',
            '-crf', '28', // New CRF
            '-preset', 'ultrafast',
            '-movflags', '+faststart', // Added for better streamability
            '-loglevel', 'error',     // Added to capture more detailed errors from FFmpeg
            outputFileName
          ];
          await ffmpeg.exec(ffmpegCommand);

          const fileData: FileData = await ffmpeg.readFile(outputFileName);

          let compressedFile: File;
          if (fileData instanceof Uint8Array) {
            if (fileData.length === 0) {
              console.error('FFmpeg: Critical Error - Output fileData is Uint8Array but its length is 0. This will result in an empty blob.');
            }
            compressedFile = new File([fileData.buffer], file.name.replace(/\.[^/.]+$/, "_c.mp4"), { type: 'video/mp4' });
          } else {
            console.error(`FFmpeg: Critical Error - Output fileData is NOT Uint8Array. Type: ${typeof fileData}. This is unexpected for video data.`);
            throw new Error('FFmpeg output was not in the expected format (Uint8Array).');
          }

          if (compressedFile.size === 0) {
            console.error('Compression resulted in a zero-byte file. Reverting to original file.');
            onError('Video compression failed, resulting in an empty file. The original file will be used if you proceed.');

            // Clean up potentially corrupted FFmpeg files
            await ffmpeg.deleteFile(safeInputFileName);
            await ffmpeg.deleteFile(outputFileName);

            // Revoke URL from potentially empty compressed file preview
            if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);

            // Revert to original file for preview and upload
            // const originalPreviewUrl = URL.createObjectURL(file); // 'file' is the original input file
            // setPreview(originalPreviewUrl); // Already set by originalPreviewUrlWhileCompressing or fallback
            setSelectedMedia(file);
            onMediaSelect(file); // Pass original file to parent
            setIsVideo(true);
            setIsCompressing(false); // Stop compression indication
            setCompressionProgress(0);
            return; // Exit further processing of compressed file
          }

          // console.log(`FFmpeg: Created compressedFile. Name: ${compressedFile.name}, Size: ${compressedFile.size}, Type: ${compressedFile.type}`);
          // Clean up virtual file system
            // Ensure ffmpeg and deleteFile are valid before calling
            if (ffmpeg && ffmpeg.loaded) {
              try {
                await ffmpeg.deleteFile(safeInputFileName);
                await ffmpeg.deleteFile(outputFileName);
              } catch (deleteError) {
                // console.warn("FFmpeg: Error deleting files from FS, FFmpeg might have been terminated:", deleteError);
              }
            }
          // Revoke old preview URL
          if (originalPreviewUrlWhileCompressing) URL.revokeObjectURL(originalPreviewUrlWhileCompressing);

          // Create preview for compressed file
          const compressedPreviewUrl = URL.createObjectURL(compressedFile);
          setPreview(compressedPreviewUrl);
          setSelectedMedia(compressedFile);
          onMediaSelect(compressedFile); // Pass compressed file to parent
          setIsVideo(true); // Ensure isVideo is true for the compressed file

        } catch (err) {
          // console.error("Error during video compression (MediaUploader):", err); // Removed as onError is called
          onError('Failed to compress video. Uploading original or try another file.');
          // Revert to original file if compression fails
          if (preview && preview !== originalPreviewUrlWhileCompressing) URL.revokeObjectURL(preview as string);
          if (originalPreviewUrlWhileCompressing && preview !== originalPreviewUrlWhileCompressing) URL.revokeObjectURL(originalPreviewUrlWhileCompressing);

          const originalPreviewFallbackUrl = URL.createObjectURL(file);
          setPreview(originalPreviewFallbackUrl);
          setSelectedMedia(file);
          onMediaSelect(file);
          setIsVideo(true);
        } finally {
          setIsCompressing(false);
          setCompressionProgress(0);
        }
      } else {
        // --- File is <= threshold, bypass compression ---
        if (preview) URL.revokeObjectURL(preview); // Clean up any existing preview from a previous selection

        // Create a blob URL preview for videos (more consistent with compressed path):
        const directPreviewUrl = URL.createObjectURL(file);
        setPreview(directPreviewUrl);

        setSelectedMedia(file);
        onMediaSelect(file);
        setIsVideo(true); // Still a video, just not compressed
        setIsCompressing(false); // Ensure this is false
        setCompressionProgress(0); // Ensure this is 0
      }
    } else { // Handle image files
      if (preview) URL.revokeObjectURL(preview); // Clean up previous preview if any
      setIsVideo(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedMedia(file);
      onMediaSelect(file);
    }
  } else { // Handle null file (deselection)
    if (preview) URL.revokeObjectURL(preview); // Clean up previous preview
    setSelectedMedia(null);
    setPreview(null);
    setIsVideo(false);
    onMediaSelect(null);
  }
}, [maxSizeBytes, maxSizeMB, onError, onMediaSelect, preview, loadFFmpeg, ffmpegLoadError]);
  
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
        accept="image/*,video/*"
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
            disabled={isCompressing || disabled} // Modify this
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