/**
 * Check if a string is empty or contains only whitespace
 * @param value - String to check
 * @returns True if empty, false otherwise
 */
export const isEmpty = (value: string): boolean => {
    return value.trim() === '';
  };
  
  /**
   * Check if a value is undefined or null
   * @param value - Value to check
   * @returns True if undefined or null, false otherwise
   */
  export const isNil = (value: any): boolean => {
    return value === undefined || value === null;
  };
  
  /**
   * Check if a string is a valid email address
   * @param email - Email to validate
   * @returns True if valid, false otherwise
   */
  export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Check if a string is a valid URL
   * @param url - URL to validate
   * @returns True if valid, false otherwise
   */
  export const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Check if a string is a strong password (min 8 chars, with number and special char)
   * @param password - Password to validate
   * @returns True if strong, false otherwise
   */
  export const isStrongPassword = (password: string): boolean => {
    // At least 8 characters with at least one number and one special character
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(.{8,})$/;
    return passwordRegex.test(password);
  };
  
  /**
   * Calculate password strength score (0-4)
   * @param password - Password to evaluate
   * @returns Score from 0 (very weak) to 4 (very strong)
   */
  export const getPasswordStrength = (password: string): number => {
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[0-9]/.test(password)) score += 1;
    if (/[!@#$%^&*]/.test(password)) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    
    return Math.min(4, score);
  };
  
  /**
   * Check if a file's type is one of the allowed types
   * @param file - File to check
   * @param allowedTypes - Array of allowed MIME types
   * @returns True if file type is allowed, false otherwise
   */
  export const isAllowedFileType = (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  };
  
  /**
   * Check if a file's size is within the allowed limit
   * @param file - File to check
   * @param maxSizeInBytes - Maximum allowed size in bytes
   * @returns True if file size is within limit, false otherwise
   */
  export const isAllowedFileSize = (file: File, maxSizeInBytes: number): boolean => {
    return file.size <= maxSizeInBytes;
  };
  
  /**
   * Check if a string is within a specified length range
   * @param value - String to check
   * @param minLength - Minimum allowed length
   * @param maxLength - Maximum allowed length
   * @returns True if within range, false otherwise
   */
  export const isWithinLengthRange = (
    value: string,
    minLength: number,
    maxLength: number
  ): boolean => {
    const length = value.trim().length;
    return length >= minLength && length <= maxLength;
  };
  
  /**
   * Check if a device has a camera (only a basic check, may not be reliable)
   * @returns Promise that resolves to true if camera exists, false otherwise
   */
  export const hasCamera = async (): Promise<boolean> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return false;
    }
    
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error checking camera availability:', error);
      return false;
    }
  };
  
  /**
   * Check if browser supports media recording
   * @returns True if supported, false otherwise
   */
  export const supportsMediaRecording = (): boolean => {
    return (
      typeof MediaRecorder !== 'undefined' &&
      !!navigator.mediaDevices &&
      !!navigator.mediaDevices.getUserMedia
    );
  };
  
  /**
   * Check if a browser is mobile
   * @returns True if mobile, false otherwise
   */
  export const isMobileBrowser = (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };