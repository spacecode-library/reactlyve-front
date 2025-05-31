import { FFmpeg, FileData } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { classNames } from '../../utils/classNames';

interface MediaUploaderProps {
  onMediaSelect: (file: File | null) => void;
  onError: (message: string) => void;
  maxSizeMB?: number;
}

const FFMPEG_CORE_BASE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onMediaSelect,
  onError,
  maxSizeMB = 100, // Default max size is 100MB
}) => {
  const ffmpegRef = useRef(new FFmpeg());
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressionProgress, setCompressionProgress] = useState<number>(0);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert MB to bytes
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  useEffect(() => {
    const ffmpegInstance = ffmpegRef.current;
    return () => {
      if (ffmpegInstance && ffmpegInstance.loaded) {
        // console.log('Terminating FFmpeg on component unmount');
        ffmpegInstance.terminate();
      }
    };
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
      const ffmpeg = ffmpegRef.current;
      
      if (isVideoFile) {
        setIsCompressing(true);
        setCompressionProgress(0);
        // Show original file info and preview while compressing
        setSelectedMedia(file);
        const originalPreviewUrl = URL.createObjectURL(file);
        setPreview(originalPreviewUrl);
        setIsVideo(true); // Set isVideo true for the original file being processed

        try {
          if (!ffmpeg.loaded) {
            const coreURL = await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`, 'text/javascript');
            const wasmURL = await toBlobURL(`${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm');
            // console.log('Loading FFmpeg core...');
            await ffmpeg.load({ coreURL, wasmURL });
            // console.log('FFmpeg core loaded.');
          }

          ffmpeg.on('progress', ({ progress }) => {
            setCompressionProgress(progress < 0 ? 0 : progress > 1 ? 1 : progress);
          });
          ffmpeg.on('log', (logEntry) => {
            // console.log(`FFmpeg internal log: ${logEntry.message}`);
            // Check if message content indicates an error, as 'level' is not reliably typed
            if (typeof logEntry.message === 'string' && logEntry.message.toLowerCase().includes('error')) {
                console.error(`FFmpeg Error Log: ${logEntry.message}`);
            }
         });

          const inputFileName = file.name;
          // Sanitize filename for ffmpeg's virtual FS if necessary, though often not an issue with modern ffmpeg.wasm
          const safeInputFileName = "input." + file.name.split('.').pop(); // e.g., input.mp4
          const outputFileName = safeInputFileName.replace(/\.[^/.]+$/, "") + "_compressed.mp4"; // e.g., input_compressed.mp4

          // console.log(`Writing file to FFmpeg FS: ${safeInputFileName}`);
          await ffmpeg.writeFile(safeInputFileName, await fetchFile(file));

          // console.log(`FFmpeg: Input file name for exec: ${safeInputFileName}`);
          // console.log(`FFmpeg: Output file name for exec: ${outputFileName}`);
          const ffmpegCommand = [
            '-i', safeInputFileName,
            '-vf', "scale='if(gt(iw,ih),1280,-2)':'if(gt(iw,ih),-2,1280)'", // Updated scaling
            '-c:v', 'libx264',
            '-crf', '25', // New CRF
            '-preset', 'ultrafast',
            '-movflags', '+faststart', // Added for better streamability
            '-loglevel', 'error',     // Added to capture more detailed errors from FFmpeg
            outputFileName
          ];
          // console.log('FFmpeg: Executing command:', ffmpegCommand.join(' '));
          await ffmpeg.exec(ffmpegCommand);
          // console.log('FFmpeg command finished.');

          const fileData: FileData = await ffmpeg.readFile(outputFileName);
          // console.log('FFmpeg: readFile command finished.');

          let compressedFile: File;
          if (fileData instanceof Uint8Array) {
            // console.log(`FFmpeg: Output fileData is Uint8Array. Length: ${fileData.length}`);
            if (fileData.length === 0) {
              console.error('FFmpeg: Critical Error - Output fileData is Uint8Array but its length is 0. This will result in an empty blob.');
            }
            compressedFile = new File([fileData.buffer], file.name.replace(/\.[^/.]+$/, "_c.mp4"), { type: 'video/mp4' });
            // console.log(`FFmpeg: Created compressedFile. Name: ${compressedFile.name}, Size: ${compressedFile.size}, Type: ${compressedFile.type}`);
          } else {
            console.error(`FFmpeg: Critical Error - Output fileData is NOT Uint8Array. Type: ${typeof fileData}. This is unexpected for video data.`);
            // This will throw the error defined in the previous step, which is good.
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
            const originalPreviewUrl = URL.createObjectURL(file); // 'file' is the original input file
            setPreview(originalPreviewUrl);
            setSelectedMedia(file);
            onMediaSelect(file); // Pass original file to parent
            setIsVideo(true);
            setIsCompressing(false); // Stop compression indication
            setCompressionProgress(0);
            return; // Exit further processing of compressed file
          }

          // console.log(`FFmpeg: Created compressedFile. Name: ${compressedFile.name}, Size: ${compressedFile.size}, Type: ${compressedFile.type}`);
          // Clean up virtual file system
          await ffmpeg.deleteFile(safeInputFileName);
          await ffmpeg.deleteFile(outputFileName);

          // Revoke old preview URL
          if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);

          // Create preview for compressed file
          const compressedPreviewUrl = URL.createObjectURL(compressedFile);
          setPreview(compressedPreviewUrl);
          setSelectedMedia(compressedFile);
          onMediaSelect(compressedFile); // Pass compressed file to parent
          setIsVideo(true); // Ensure isVideo is true for the compressed file
          // console.log('Compression successful.');

        } catch (err) {
          console.error("Error during video compression:", err);
          onError('Failed to compress video. Uploading original or try another file.');
          // Revert to original file if compression fails
          if (originalPreviewUrl && preview !== originalPreviewUrl) URL.revokeObjectURL(preview as string); // Clean up failed compressed preview if any
          setPreview(originalPreviewUrl); // Ensure original preview is shown
          setSelectedMedia(file);
          onMediaSelect(file); // Pass original file
          setIsVideo(true);
        } finally {
          setIsCompressing(false);
          setCompressionProgress(0);
          // FFmpeg instance is kept loaded for next compressions. Terminated on unmount or specific error.
        }
      } else { // Handle image files
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
  }, [maxSizeBytes, maxSizeMB, onError, onMediaSelect, preview]); // Added `preview` to dependencies for revokeObjectURL
  
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
    if (isCompressing && ffmpeg && ffmpeg.loaded) {
      // console.log('Terminating FFmpeg due to media removal during compression.');
      await ffmpeg.terminate(); // Terminate if removal happens during compression
      ffmpegRef.current = new FFmpeg(); // Re-initialize for next use to ensure clean state
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
      />

      {isCompressing ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-6">
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
        // Drag and drop / browse UI (existing code)
        <div
          className={classNames(
            'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-neutral-800'
              : 'border-neutral-300 hover:border-primary-400 dark:border-neutral-700 dark:hover:border-primary-600'
          )}
          onClick={handleBrowseClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
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
            disabled={isCompressing} // Disable remove button during compression
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