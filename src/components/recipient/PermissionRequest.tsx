import React from 'react';
import { isIOS } from '../../utils/mediaHelpers';
import { REACTION_ERRORS } from '../../components/constants/errorMessages';

interface PermissionRequestProps {
  onCancel: () => void;
  permissionType: 'camera' | 'microphone' | 'both';
  errorMessage?: string;
  isReplyMode?: boolean;
}

const PermissionRequest: React.FC<PermissionRequestProps> = ({
  onCancel,
  permissionType,
  errorMessage,
  isReplyMode = false,
}) => {
  const isReactionLimitError = errorMessage === REACTION_ERRORS.REACTION_LIMIT_CONTACT_SENDER;
  const isIOSDevice = isIOS();
  const isMacOS = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const isChrome = navigator.userAgent.indexOf('Chrome') > -1;
  const isSafari = navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') === -1;
  const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
  const isEdge = navigator.userAgent.indexOf('Edg') > -1;

  const getPermissionText = () => {
    switch (permissionType) {
      case 'camera':
        return 'camera';
      case 'microphone':
        return 'microphone';
      case 'both':
        return 'camera and microphone';
      default:
        return 'device';
    }
  };

  const getPlatformInstructions = () => {
    if (isIOSDevice) {
      return (
        <>
          <h4 className="mt-4 font-medium">iOS Instructions:</h4>
          <ol className="ml-5 mt-2 list-decimal space-y-1 text-sm">
            <li>Open <strong>Settings</strong> on your device</li>
            <li>Scroll down and tap <strong>Safari</strong> (or your browser)</li>
            <li>Scroll to <strong>Settings for Websites</strong></li>
            <li>Tap <strong>Camera</strong> and/or <strong>Microphone</strong></li>
            <li>Select <strong>Allow</strong> for this website</li>
            <li>Refresh this page</li>
          </ol>
        </>
      );
    } else if (isMacOS) {
      return (
        <>
          <h4 className="mt-4 font-medium">macOS Instructions:</h4>
          <ol className="ml-5 mt-2 list-decimal space-y-1 text-sm">
            <li>Open <strong>System Preferences</strong></li>
            <li>Click <strong>Security & Privacy</strong></li>
            <li>Select the <strong>Privacy</strong> tab</li>
            <li>Click <strong>Camera</strong> and/or <strong>Microphone</strong></li>
            <li>Check your browser</li>
            <li>Restart your browser and try again</li>
          </ol>
        </>
      );
    } else if (isChrome) {
      return (
        <>
          <h4 className="mt-4 font-medium">Chrome Instructions:</h4>
          <ol className="ml-5 mt-2 list-decimal space-y-1 text-sm">
            <li>Click the lock icon in the address bar</li>
            <li>Select <strong>Allow</strong> for "{getPermissionText()}"</li>
            <li>Refresh the page</li>
          </ol>
        </>
      );
    } else if (isFirefox) {
      return (
        <>
          <h4 className="mt-4 font-medium">Firefox Instructions:</h4>
          <ol className="ml-5 mt-2 list-decimal space-y-1 text-sm">
            <li>Click the lock icon in the address bar</li>
            <li>Click <strong>More Information</strong></li>
            <li>Go to the <strong>Permissions</strong> tab</li>
            <li>Allow "Use the {getPermissionText()}"</li>
            <li>Refresh the page</li>
          </ol>
        </>
      );
    } else if (isEdge) {
      return (
        <>
          <h4 className="mt-4 font-medium">Edge Instructions:</h4>
          <ol className="ml-5 mt-2 list-decimal space-y-1 text-sm">
            <li>Click the lock icon in the address bar</li>
            <li>Select <strong>Allow</strong> for "{getPermissionText()} access"</li>
            <li>Refresh the page</li>
          </ol>
        </>
      );
    } else if (isSafari) {
      return (
        <>
          <h4 className="mt-4 font-medium">Safari Instructions:</h4>
          <ol className="ml-5 mt-2 list-decimal space-y-1 text-sm">
            <li>Click <strong>Safari</strong> in the top menu</li>
            <li>Select <strong>Settings for This Website...</strong></li>
            <li>Set "{getPermissionText()} access" to <strong>Allow</strong></li>
            <li>Refresh the page</li>
          </ol>
        </>
      );
    } else {
      return (
        <>
          <h4 className="mt-4 font-medium">Browser Instructions:</h4>
          <ol className="ml-5 mt-2 list-decimal space-y-1 text-sm">
            <li>Check for a permission dialog</li>
            <li>Click <strong>Allow</strong></li>
            <li>Click the lock or info icon in the address bar if needed</li>
            <li>Update {getPermissionText()} permissions</li>
            <li>Refresh the page</li>
          </ol>
        </>
      );
    }
  };

  return (
    <div className="card mx-auto max-w-md text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      
      <h3 className="mt-4 text-lg font-medium text-neutral-900 dark:text-white">
        {isReactionLimitError
          ? 'Reaction Limit Reached'
          : permissionType === 'camera'
            ? 'Camera Permission Required'
            : permissionType === 'microphone'
              ? 'Microphone Permission Required'
              : 'Camera & Microphone Permissions Required'}
      </h3>
      
      {!isReactionLimitError && (
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          We need access to your {getPermissionText()} to record your {isReplyMode ? 'reply' : 'reaction'}. Please allow access in your browser.
        </p>
      )}
      
      {isReactionLimitError && errorMessage && (
        <div className="mt-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/30"> {/* Using a more neutral/info color */}
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 text-center">
            {errorMessage}
          </p>
        </div>
      )}
      {errorMessage && !isReactionLimitError && (
        <div className="mt-4 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-300">
            Error: {errorMessage}
          </p>
        </div>
      )}
      
      {!isReactionLimitError && (
        <div className="mt-4 text-left">
          <h4 className="font-medium text-neutral-900 dark:text-white">How to enable access:</h4>
          {getPlatformInstructions()}
        </div>
      )}
      
      <div className="mt-6 flex justify-center space-x-3">
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600"
        >
          Refresh Page
        </button>
        
        {!errorMessage && (
          <button
            onClick={onCancel}
            className="btn btn-outline"
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
};

export default PermissionRequest;