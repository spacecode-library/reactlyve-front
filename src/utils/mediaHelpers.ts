// src/utils/mediaHelpers.ts

const CLOUDINARY_LOGO_ID =
  import.meta.env.VITE_CLOUDINARY_LOGO_ID || 'Reactlyve_Logo_bi78md';

export const SMALL_FILE_TRANSFORM_WITH_OVERLAY = `f_auto,q_auto/l_${CLOUDINARY_LOGO_ID}/fl_layer_apply,w_0.3,g_south_east,x_10,y_10`;
export const LARGE_FILE_TRANSFORM_WITH_OVERLAY = `w_1280,c_limit,q_auto,f_auto/l_${CLOUDINARY_LOGO_ID}/fl_layer_apply,w_0.3,g_south_east,x_10,y_10`;

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

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      video.currentTime = Math.min(seekTime, video.duration);
    };

    video.onseeked = () => {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
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
      img.onerror = () => reject(new Error('Error loading image'));
    };
    reader.onerror = () => reject(new Error('Error reading file'));
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
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : '';
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
 * Get a transformed Cloudinary URL.
 * Applies transformations based on file size and attempts to clean existing transformations.
 * @param originalUrl - The original Cloudinary URL
 * @param fileSizeInBytes - The size of the file in bytes
 * @returns The transformed Cloudinary URL
 */
export const getTransformedCloudinaryUrl = (
  originalUrl: string,
  fileSizeInBytes: number
): string => {
  const tenMBInBytes = 10 * 1024 * 1024; // 10MB threshold

  const transformationString = fileSizeInBytes < tenMBInBytes
    ? SMALL_FILE_TRANSFORM_WITH_OVERLAY
    : LARGE_FILE_TRANSFORM_WITH_OVERLAY;

  const uploadMarker = '/upload/';
  const parts = originalUrl.split(uploadMarker);

  if (parts.length === 2) {
    const baseUrl = parts[0];
    let pathAfterUpload = parts[1];

    const regex = /^(?:(.*?\/)(v\d+\/.*)|(.*))$/;
    const match = pathAfterUpload.match(regex);
    let publicPath = '';

    if (match) {
      if (match[2]) {
        publicPath = match[2];
        // const oldTransformations = match[1] || ''; // Removed console.log related
        // if (oldTransformations) { // Removed console.log related
          // console.log(`[getTransformedCloudinaryUrl] Info: Stripped old transformations "${oldTransformations}" from path "${pathAfterUpload}" because a version string was found.`); // Removed
        // } // Removed console.log related
      } else if (match[3]) {
        publicPath = match[3];
        // const pathSegments = publicPath.split('/'); // Removed console.log related
        // const finalSegment = pathSegments[pathSegments.length - 1]; // Removed console.log related
        // const leadingPath = pathSegments.slice(0, -1).join('/'); // Removed console.log related

        // if (pathSegments.length > 1 && /[a-z_]+,/.test(leadingPath) && !leadingPath.includes('.')) { // Removed console.log related
             // console.warn(`[getTransformedCloudinaryUrl] Warning: No version string found in path "${pathAfterUpload}". The path "${leadingPath}" before the final segment "${finalSegment}" looks like it might contain transformations. Prepending new transformation "${transformationString}". This could lead to nested transformations like "${transformationString}/${publicPath}". Original URL: "${originalUrl}"`); // Removed
        // } else if (pathSegments.length > 1) { // Removed console.log related
             // console.log(`[getTransformedCloudinaryUrl] Info: No version string found in path "${pathAfterUpload}". Path contains folders. Applying transformation "${transformationString}" before full path "${publicPath}". Original URL: "${originalUrl}"`); // Removed
        // } else { // Removed console.log related
             // console.log(`[getTransformedCloudinaryUrl] Info: No version string found in path "${pathAfterUpload}". Path is a simple public_id. Applying transformation "${transformationString}" before public_id "${publicPath}". Original URL: "${originalUrl}"`); // Removed
        // } // Removed console.log related
      } else {
        publicPath = pathAfterUpload;
        // console.warn(`[getTransformedCloudinaryUrl] Warning: Could not reliably parse path "${pathAfterUpload}" using regex. Using full path. Original URL: "${originalUrl}"`); // Removed
      }
    } else {
      publicPath = pathAfterUpload;
      // console.error(`[getTransformedCloudinaryUrl] CRITICAL: Regex failed to match path "${pathAfterUpload}". This indicates a flaw in the regex or an unexpected URL structure. Using full path. Original URL: "${originalUrl}"`); // Removed
    }

    const newUrl = `${baseUrl}${uploadMarker}${transformationString}/${publicPath}`;
    // console.log(`[getTransformedCloudinaryUrl] Output - New URL: "${newUrl}"`); // Removed
    return newUrl;
  }

  // console.warn(`[getTransformedCloudinaryUrl] Warning: Original URL "${originalUrl}" does not seem to be a valid Cloudinary URL (missing "${uploadMarker}" marker). Returning original URL.`); // Removed
  return originalUrl;
};
