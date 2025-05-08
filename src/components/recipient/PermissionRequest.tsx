import React from 'react';
import { isIOS } from '../../utils/mediaHelpers';

interface PermissionRequestProps {
  onCancel: () => void;
  permissionType: 'camera' | 'microphone' | 'both';
  errorMessage?: string;
}

const PermissionRequest: React.FC<PermissionRequestProps> = ({
  onCancel,
  permissionType,
  errorMessage,
}) => {
  // Determine the device type and browser for specific instructions
  const isIOSDevice = isIOS();
  const isMacOS = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const isChrome = navigator.userAgent.indexOf('Chrome') > -1;
  const isSafari = navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') === -1;
  const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
  const isEdge = navigator.userAgent.indexOf('Edg') > -1;

  // Get permission text based on type
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

  // Get platform-specific instructions
  const getPlatformInstructions = () => {
    if (isIOSDevice) {
      return (
        <>
          <h4 className="mt-4 font-medium">iOS Instructions:</h4>
          <ol className="ml-5 mt-2 list-decimal space-y-1 text-sm">
            <li>Open <strong>Settings</strong> on your device</li>
            <li>Scroll down and tap <strong>Safari</strong> (or the browser you're using)</li>
            <li>Scroll down to <strong>Settings for Websites</strong></li>
            <li>Tap <strong>Camera</strong> and/or <strong>Microphone</strong></li>
            <li>Find this website and select <strong>Allow</strong></li>
            <li>Return to this page and refresh</li>
          </ol>
        </>
      );
    } else if (isMacOS) {
      return (
        <>
          <h4 className="mt-4 font-medium">macOS Instructions:</h4>
          <ol className="ml-5 mt-2 list-decimal space-y-1 text-sm">
            <li>Open <strong>System Preferences</strong></li>
            <li>Click on <strong>Security & Privacy</strong></li>
            <li>Select the <strong>Privacy</strong> tab</li>
            <li>Click on <strong>Camera</strong> and/or <strong>Microphone</strong> in the sidebar</li>
            <li>Make sure your browser is checked</li>
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
            <li>Under "{getPermissionText()}", select <strong>Allow</strong></li>
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
            <li>Click on <strong>More Information</strong></li>
            <li>Go to the <strong>Permissions</strong> tab</li>
            <li>Find "Use the {getPermissionText()}" and change to <strong>Allow</strong></li>
            <li>Close the dialog and refresh the page</li>
          </ol>
        </>
      );
    } else if (isEdge) {
      return (
        <>
          <h4 className="mt-4 font-medium">Edge Instructions:</h4>
          <ol className="ml-5 mt-2 list-decimal space-y-1 text-sm">
            <li>Click the lock icon in the address bar</li>
            <li>Under "{getPermissionText()} access", select <strong>Allow</strong></li>
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
      // Generic instructions
      return (
        <>
          <h4 className="mt-4 font-medium">Browser Instructions:</h4>
          <ol className="ml-5 mt-2 list-decimal space-y-1 text-sm">
            <li>Look for the permission dialog that may have appeared</li>
            <li>Click <strong>Allow</strong> to give permission</li>
            <li>If no dialog appeared, click the lock or info icon in your address bar</li>
            <li>Update the permission settings for {getPermissionText()}</li>
            <li>Refresh the page after making changes</li>
          </ol>
        </>
      );
    }
  };

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-800 dark:bg-yellow-900/20">
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
      
      <h3 className="mt-4 text-lg font-medium text-yellow-800 dark:text-yellow-300">
        {permissionType === 'camera' 
          ? 'Camera Permission Required' 
          : permissionType === 'microphone' 
            ? 'Microphone Permission Required' 
            : 'Camera & Microphone Permissions Required'}
      </h3>
      
      <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
        To record your reaction, we need permission to access your {getPermissionText()}.
        Please allow access when prompted by your browser.
      </p>
      
      {errorMessage && (
        <div className="mt-4 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-300">
            Error: {errorMessage}
          </p>
        </div>
      )}
      
      <div className="mt-4 text-left">
        <h4 className="font-medium text-yellow-800 dark:text-yellow-300">How to enable access:</h4>
        {getPlatformInstructions()}
      </div>
      
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => window.location.reload()}
          className="mr-3 rounded-md bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:bg-yellow-800 dark:text-yellow-100 dark:hover:bg-yellow-700"
        >
          Refresh Page
        </button>
        
        <button
          onClick={onCancel}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default PermissionRequest;