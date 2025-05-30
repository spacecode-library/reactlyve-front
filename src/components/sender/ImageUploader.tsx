import React, { useState, useCallback, useRef } from 'react';
import { isAllowedFileType, isAllowedFileSize } from '../../utils/validators';
import { formatBytes } from '../../utils/formatters';
import { compressImage } from '../../utils/mediaHelpers';
import { classNames } from '../../utils/classNames';

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void;
  onError?: (error: string) => void;
  maxSizeInBytes?: number;
  allowedTypes?: string[];
  className?: string;
  initialImage?: File | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  onError,
  maxSizeInBytes = 100 * 1024 * 1024, // 100MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp',    'video/mp4',
    'video/webm',
    'video/ogg'],
  className,
  initialImage = null,
}) => {
  const [image, setImage] = useState<File | null>(initialImage);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create an object URL for preview when image changes
  const updatePreview = useCallback((file: File | null) => {
    // Revoke previous preview URL to prevent memory leaks
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    } else {
      setPreview(null);
    }
  }, [preview]);

  // Handle file validation and update
  const handleFileValidation = useCallback(async (file: File) => {
    // Check file type
    if (!isAllowedFileType(file, allowedTypes)) {
      const errorMsg = `File type not allowed. Please upload ${allowedTypes.join(', ')} files only.`;
      onError?.(errorMsg);
      return null;
    }
    
    // Check if file needs compression
    if (file.size > maxSizeInBytes) {
      try {
        setIsCompressing(true);
        const compressedImage = await compressImage(
          file,
          1600, // Max width/height after compression
          0.8 // Quality
        );
        
        // Check if compressed file is within size limit
        if (compressedImage.size > maxSizeInBytes) {
          const errorMsg = `File is too large. Maximum size is ${formatBytes(maxSizeInBytes)}.`;
          onError?.(errorMsg);
          setIsCompressing(false);
          return null;
        }
        
        // Create new File object from compressed Blob
        const compressedFile = new File([compressedImage], file.name, {
          type: file.type,
          lastModified: Date.now(),
        });
        
        setIsCompressing(false);
        return compressedFile;
      } catch (error) {
        console.error('Error compressing image:', error);
        const errorMsg = 'Error compressing image. Please try a smaller file.';
        onError?.(errorMsg);
        setIsCompressing(false);
        return null;
      }
    }
    
    // If file is already within size limit, return as is
    return file;
  }, [allowedTypes, maxSizeInBytes, onError]);

  // Handle file change from input
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    if (file) {
      const validatedFile = await handleFileValidation(file);
      
      if (validatedFile) {
        setImage(validatedFile);
        updatePreview(validatedFile);
        onImageSelect(validatedFile);
      }
    }
    
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileValidation, updatePreview, onImageSelect]);

  // Handle file drop
  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    
    const file = event.dataTransfer.files?.[0] || null;
    
    if (file) {
      const validatedFile = await handleFileValidation(file);
      
      if (validatedFile) {
        setImage(validatedFile);
        updatePreview(validatedFile);
        onImageSelect(validatedFile);
      }
    }
  }, [handleFileValidation, updatePreview, onImageSelect]);

  // Handle drag events
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  // Handle remove image
  const handleRemoveImage = useCallback(() => {
    setImage(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    onImageSelect(null);
  }, [preview, onImageSelect]);

  // Handle click on upload area
  const handleUploadClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <div className={classNames('relative', className || '')}>
      {/* File input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileChange}
        className="hidden"
        aria-label="Image upload"
      />
      
      {/* Upload area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
        className={classNames(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
            : 'border-neutral-300 hover:border-primary-400 dark:border-neutral-700 dark:hover:border-primary-600',
          image ? 'h-auto' : 'h-48',
          isCompressing ? 'cursor-wait' : 'cursor-pointer'
        )}
      >
        {/* Loading state */}
        {isCompressing ? (
          <div className="flex flex-col items-center justify-center text-center">
            <svg
              className="h-10 w-10 animate-spin text-primary-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Compressing image...
            </p>
          </div>
        ) : preview ? (
          // Image preview
          <div className="relative w-full">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-96 max-w-full rounded-md object-contain"
            />
            
            {/* Image details */}
            <div className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
              {image?.name} ({formatBytes(image?.size || 0)})
            </div>
            
            {/* Remove button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="absolute -right-3 -top-3 rounded-full bg-neutral-700 p-1 text-white shadow-md hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 dark:bg-neutral-600 dark:hover:bg-neutral-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Remove image</span>
            </button>
          </div>
        ) : (
          // Upload placeholder
          <div className="flex flex-col items-center justify-center text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-neutral-400 dark:text-neutral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {isDragging ? 'Drop your image here' : 'Click to upload or drag and drop'}
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {allowedTypes.map(type => type.replace('image/', '.')).join(', ')} up to{' '}
              {formatBytes(maxSizeInBytes)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;