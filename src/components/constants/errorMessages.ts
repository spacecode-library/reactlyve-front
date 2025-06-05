// General error messages
export const GENERAL_ERRORS = {
    SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'Unauthorized. Please log in to continue.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    TIMEOUT: 'Request timed out. Please try again.',
  };
  
  // Authentication error messages
  export const AUTH_ERRORS = {
    LOGIN_FAILED: 'Login failed. Please try again.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    INVALID_CREDENTIALS: 'Invalid credentials. Please check your email and password.',
    GOOGLE_AUTH_ERROR: 'Google authentication failed. Please try again.',
    ALREADY_LOGGED_IN: 'You are already logged in.',
    ACCOUNT_NOT_FOUND: 'Account not found. Please sign up first.',
  };
  
  // Form validation error messages
  export const VALIDATION_ERRORS = {
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PASSWORD: 'Password must be at least 8 characters long and include a number and a special character.',
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',
    INVALID_URL: 'Please enter a valid URL.',
    FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
    INVALID_FILE_TYPE: 'Invalid file type. Please upload an image file (JPG, PNG, or GIF).',
    MESSAGE_TOO_LONG: 'Message is too long. Maximum length is 500 characters.',
    PASSCODE_TOO_SHORT: 'Passcode must be at least 4 characters long.',
    REACTION_LENGTH_MIN: 'Reaction recording length must be at least 10 seconds.',
    REACTION_LENGTH_MAX: 'Reaction recording length can be at most 30 seconds.',
    VIDEO_DURATION_EXCEEDED: "Video duration cannot exceed 30 seconds.",
  };
  
  // Message error messages
  export const MESSAGE_ERRORS = {
    CREATE_FAILED: 'Failed to create message. Please try again.',
    UPDATE_FAILED: 'Failed to update message. Please try again.',
    DELETE_FAILED: 'Failed to delete message. Please try again.',
    INVALID_PASSCODE: 'Invalid passcode. Please try again.',
    LINK_EXPIRED: 'This link has expired or is no longer valid.',
    NOT_FOUND: 'Message not found. It may have been deleted or the link is incorrect.',
    ALREADY_VIEWED: 'This message has already been viewed.',
  };
  
  // Reaction error messages
  export const REACTION_ERRORS = {
    RECORD_PERMISSION_DENIED: 'Camera permission denied. Please enable camera access to record your reaction.',
    RECORDING_FAILED: 'Failed to record reaction. Please try again.',
    UPLOAD_FAILED: 'Failed to upload reaction video. Please try again.',
    DOWNLOAD_FAILED: 'Failed to download reaction video. Please try again.',
    NOT_FOUND: 'Reaction not found. It may have been deleted.',
    BROWSER_NOT_SUPPORTED: 'Your browser does not support video recording. Please try a different browser.',
    SENDER_MESSAGE_REACTION_LIMIT_REACHED: "Reaction limit reached for this message.",
    REACTION_LIMIT_CONTACT_SENDER: "Please contact the person who shared this message with you regarding increasing their reaction limits."
  };
  
  // Admin error messages
  export const ADMIN_ERRORS = {
    UPDATE_USER_FAILED: 'Failed to update user. Please try again.',
    DELETE_USER_FAILED: 'Failed to delete user. Please try again.',
    STATS_FETCH_FAILED: 'Failed to fetch statistics. Please try again.',
  };