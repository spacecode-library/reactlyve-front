import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { classNames } from '../../utils/classNames';

interface MediaUploaderProps {
  onMediaSelect: (file: File | null) => void;
  onError: (message: string) => void;
  maxSizeMB?: number;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onMediaSelect,
  onError,
  maxSizeMB = 100, // Default max size is 100MB
}) => {
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Convert MB to bytes
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const handleMediaSelect = useCallback((file: File | null) => {
    if (file) {
      // Check if file size is within limits
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
      setIsVideo(isVideoFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setSelectedMedia(file);
      onMediaSelect(file);
    } else {
      setSelectedMedia(null);
      setPreview(null);
      setIsVideo(false);
      onMediaSelect(null);
    }
  }, [maxSizeBytes, maxSizeMB, onError, onMediaSelect]);
  
  const handleBrowseClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleMediaSelect(file);
  }, [handleMediaSelect]);
  
  const handleRemove = useCallback(() => {
    handleMediaSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleMediaSelect]);
  
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
        name="media" // Changed from 'image' to 'media'
      />
      
      {!selectedMedia ? (
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
        <div className="relative rounded-lg border border-neutral-300 p-2 dark:border-neutral-700">
          <div className="flex items-center space-x-3">
            {preview && (
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
                {isVideo ? (
                  <video
                    src={preview}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Media preview"
                    className="h-full w-full object-cover"
                  />
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
                <span className="text-xs text-green-600 dark:text-green-400">Ready to upload</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-neutral-100 p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-400"
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