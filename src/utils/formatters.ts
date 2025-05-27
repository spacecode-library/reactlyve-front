/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "June 1, 2023")
 */
    export const formatDate = (dateString: string | Date | null | undefined): string => {
      const date = new Date(dateString ?? '');
      if (isNaN(date.getTime())) return 'Invalid date';
    
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    };
  
  /**
   * Format a date string to a relative time (e.g., "2 days ago")
   * @param dateString - ISO date string
   * @returns Relative time string
   */
    export const formatRelativeTime = (dateString: string | Date | null | undefined): string => {
      const date = new Date(dateString ?? '');
      if (isNaN(date.getTime())) return 'Unknown time';
    
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minute(s) ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour(s) ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} day(s) ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} week(s) ago`;
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} month(s) ago`;
    
      return `${Math.floor(diffInSeconds / 31536000)} year(s) ago`;
    };

  
  /**
   * Format a number to a human-readable format with commas
   * @param num - Number to format
   * @returns Formatted number string (e.g., "1,234,567")
   */
  export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };
  
  /**
   * Format bytes to a human-readable format
   * @param bytes - Number of bytes
   * @param decimals - Number of decimal places (default: 2)
   * @returns Formatted size string (e.g., "1.5 MB")
   */
  export const formatBytes = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  /**
   * Format a duration in milliseconds to a human-readable format
   * @param durationMs - Duration in milliseconds
   * @returns Formatted duration string (e.g., "2:30")
   */
  export const formatDuration = (durationMs: number): string => {
    const seconds = Math.floor((durationMs / 1000) % 60);
    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  /**
   * Truncate a string to a specified length and add ellipsis if needed
   * @param str - String to truncate
   * @param maxLength - Maximum length (default: 50)
   * @returns Truncated string
   */
  export const truncateString = (str: string, maxLength: number = 50): string => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  };
  
  /**
   * Format a URL to a more readable form (e.g., remove protocol, www, etc.)
   * @param url - URL to format
   * @returns Formatted URL
   */
  export const formatUrl = (url: string): string => {
    try {
      const { hostname, pathname } = new URL(url);
      const domain = hostname.replace(/^www\./, '');
      const path = pathname === '/' ? '' : pathname;
      return domain + path;
    } catch (error) {
      return url;
    }
  };
  
  /**
   * Format a passcode by masking it with asterisks except for the last character
   * @param passcode - Passcode to mask
   * @returns Masked passcode
   */
  export const maskPasscode = (passcode: string): string => {
    if (passcode.length <= 1) return passcode;
    
    const lastChar = passcode.charAt(passcode.length - 1);
    const maskedPart = '•'.repeat(passcode.length - 1);
    
    return maskedPart + lastChar;
  };

/**
 * Format a date string to a human-readable date and time format
 * @param dateString - ISO date string
 * @returns Formatted date and time string (e.g., "June 1, 2023, 14:05:30")
 */
export const formatDateTime = (dateString: string | Date | null | undefined): string => {
  const date = new Date(dateString ?? '');
  if (isNaN(date.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat('en-US', { // Using 'en-US' for consistency, can be 'default'
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Use 24-hour format
  }).format(date);
};
