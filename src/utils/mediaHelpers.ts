/**
 * Request camera and microphone permissions
 * @param video - Video constraints
 * @param audio - Audio constraints
 * @returns Promise that resolves to a MediaStream or rejects with an error
 */
export const requestMediaPermissions = async (
    video: boolean | MediaTrackConstraints = true,
    audio: boolean | MediaTrackConstraints = true
  ): Promise<MediaStream> => {
    try {
      return await navigator.mediaDevices.getUserMedia({ video, audio });
    } catch (error) {
      console.error('Error requesting media permissions:', error);
      throw error;
    }
  };
  
  /**
   * Check camera permission status
   * @returns Promise that resolves to the permission state or null if not supported
   */
  export const checkCameraPermission = async (): Promise<PermissionState | null> => {
    if (!navigator.permissions || !navigator.permissions.query) {
      return null;
    }
    
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return result.state;
    } catch (error) {
      console.error('Error checking camera permission:', error);
      return null;
    }
  };
  
  /**
   * Create a video thumbnail from a blob
   * @param videoBlob - Video blob to create thumbnail from
   * @param seekTime - Time to seek to in seconds (default: 1)
   * @returns Promise that resolves to a data URL of the thumbnail
   */
  export const createVideoThumbnail = async (
    videoBlob: Blob,
    seekTime: number = 1
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      video.autoplay = false;
      video.muted = true;
      video.src = URL.createObjectURL(videoBlob);
      
      // Wait for video metadata to load
      video.onloadedmetadata = () => {
        // Set canvas dimensions to video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Seek to specified time
        video.currentTime = Math.min(seekTime, video.duration);
      };
      
      // Once seeked to the desired time
      video.onseeked = () => {
        // Draw video frame on canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Clean up
        URL.revokeObjectURL(video.src);
        video.remove();
        
        resolve(dataUrl);
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Error loading video'));
      };
    });
  };
  
  /**
   * Compress an image file to reduce size
   * @param file - Image file to compress
   * @param maxWidthOrHeight - Maximum width or height in pixels
   * @param quality - JPEG quality (0-1)
   * @returns Promise that resolves to a compressed image blob
   */
  export const compressImage = async (
    file: File,
    maxWidthOrHeight: number = 1200,
    quality: number = 0.8
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = event => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidthOrHeight) {
              height = Math.round((height * maxWidthOrHeight) / width);
              width = maxWidthOrHeight;
            }
          } else {
            if (height > maxWidthOrHeight) {
              width = Math.round((width * maxWidthOrHeight) / height);
              height = maxWidthOrHeight;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob
          canvas.toBlob(
            blob => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create image blob'));
              }
            },
            file.type,
            quality
          );
        };
        
        img.onerror = () => {
          reject(new Error('Error loading image'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
    });
  };
  
  /**
   * Convert a blob to a data URL
   * @param blob - Blob to convert
   * @returns Promise that resolves to a data URL
   */
  export const blobToDataUrl = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  /**
   * Convert a data URL to a blob
   * @param dataUrl - Data URL to convert
   * @returns Blob created from the data URL
   */
  export const dataUrlToBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  };
  
  /**
   * Download a blob as a file
   * @param blob - Blob to download
   * @param filename - Name for the downloaded file
   */
  export const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  /**
   * Get supported video MIME types for recording
   * @returns Array of supported video MIME types
   */
  export const getSupportedVideoMimeTypes = (): string[] => {
    const types = [
      'video/webm',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm;codecs=h264',
      'video/mp4',
      'video/mp4;codecs=h264',
    ];
    
    return types.filter(type => MediaRecorder.isTypeSupported(type));
  };
  
  /**
   * Get the best supported video MIME type for recording
   * @returns The best supported MIME type or empty string if none supported
   */
  export const getBestSupportedVideoMimeType = (): string => {
    const supportedTypes = getSupportedVideoMimeTypes();
    return supportedTypes.length > 0 ? supportedTypes[0] : '';
  };
  
  /**
   * Check if the device is iOS
   * @returns True if iOS device, false otherwise
   */
  export const isIOS = (): boolean => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  };

  /**
   * Get a transformed Cloudinary URL based on file size.
   * Uses a smaller transformation for files under 10MB.
   * @param originalUrl - The original Cloudinary URL
   * @param fileSizeInBytes - The size of the file in bytes
   * @returns The transformed Cloudinary URL
   */
  export const getTransformedCloudinaryUrl = (originalUrl: string, fileSizeInBytes: number): string => {
    const smallFileTransformation = "f_auto";
    const largeFileTransformation = "w_1280,c_limit,q_auto,f_auto";
    const tenMBInBytes = 10 * 1024 * 1024;

    // Determine the transformation string based on file size
    const transformationString = fileSizeInBytes < tenMBInBytes ? smallFileTransformation : largeFileTransformation;

    const parts = originalUrl.split('/upload/');

    if (parts.length === 2) {
      const baseUrl = parts[0]; // e.g., https://res.cloudinary.com/cloud_name/resource_type
      let pathWithVersionAndPublicId = parts[1]; // This part contains version, public_id, and might contain existing transformations

      // Check if pathWithVersionAndPublicId starts directly with a version number (e.g., "v12345/folder/image.jpg")
      // Or if it starts with a transformation string (e.g., "w_100,h_100/v12345/folder/image.jpg")
      if (/^v\d+\//.test(pathWithVersionAndPublicId)) {
        // No existing transformation string found before the version number.
        // pathWithVersionAndPublicId is already in the form "v123/folder/file.ext"
        // We can directly prepend the new transformation.
      } else {
        // An existing transformation string is present before the version number.
        // e.g., pathWithVersionAndPublicId is "old_transform/v123/folder/file.ext"
        // We need to strip "old_transform/" to get "v123/folder/file.ext"
        const firstSlashIndex = pathWithVersionAndPublicId.indexOf('/');
        if (firstSlashIndex !== -1) {
          pathWithVersionAndPublicId = pathWithVersionAndPublicId.substring(firstSlashIndex + 1);
        } else {
          // This case implies the URL part after /upload/ is malformed if it's not a version and has no slash.
          // Log a warning and proceed, though the resulting URL might be incorrect.
          console.warn('[getTransformedCloudinaryUrl] Could not reliably strip existing transformation. Original path part:', pathWithVersionAndPublicId);
        }
      }
      return `${baseUrl}/upload/${transformationString}/${pathWithVersionAndPublicId}`;
    }

    console.warn('[getTransformedCloudinaryUrl] Original URL does not match expected Cloudinary structure. Returning original URL:', originalUrl);
    return originalUrl;
  };
