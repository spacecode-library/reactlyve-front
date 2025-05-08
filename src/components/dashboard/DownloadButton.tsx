import React, { useState } from 'react';
import { reactionsApi } from '../../services/api';
import { downloadBlob } from '../../utils/mediaHelpers';
import { showToast } from '../common/ErrorToast';
import Button from '../common/Button';

interface DownloadButtonProps {
  reactionId: string;
  fileName?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  reactionId,
  fileName = 'reaction.webm',
  variant = 'outline',
  size = 'md',
  className,
  showIcon = true,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDownload = async () => {
    setIsLoading(true);
    
    try {
      // Get reaction video
      const response = await reactionsApi.getById(reactionId);
      
      // Create a Blob from the response data
      const blob = new Blob([response.data], { type: 'video/webm' });
      
      // Download the Blob as a file
      downloadBlob(blob, fileName);
      
      showToast({
        message: 'Video downloaded successfully',
        type: 'success',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error downloading reaction:', error);
      
      showToast({
        message: 'Failed to download video. Please try again.',
        type: 'error',
      });
      
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
      isLoading={isLoading}
      leftIcon={
        showIcon ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        ) : undefined
      }
    >
      {isLoading ? 'Downloading...' : 'Download'}
    </Button>
  );
};

export default DownloadButton;