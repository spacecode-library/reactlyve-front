import React, { useState } from 'react';
import { Reaction } from '../../types/reaction';
import { formatDate, formatDuration } from '../../utils/formatters';
import { classNames } from '../../utils/classNames';
import Modal from '../common/Modal';
import VideoPlayer from './VideoPlayer';
import DownloadButton from './DownloadButton';
import Button from '../common/Button';

interface ReactionViewerProps {
  reaction: Reaction;
  messageSummary?: string;
  onDeleteReaction?: (reactionId: string) => void;
  onClose: () => void;
  className?: string;
}

const ReactionViewer: React.FC<ReactionViewerProps> = ({
  reaction,
  messageSummary,
  onDeleteReaction,
  onClose,
  className,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Toggle play/pause
  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Open delete confirmation modal
  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };
  
  // Close delete confirmation modal
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };
  
  // Confirm deletion
  const handleConfirmDelete = () => {
    if (onDeleteReaction) {
      onDeleteReaction(reaction.id);
    }
    handleCloseDeleteModal();
    onClose();
  };
  
  return (
    <div className={classNames('rounded-lg bg-white shadow-lg dark:bg-neutral-800', className || '')}>
      <div className="p-4 sm:p-6">
        {/* Reaction info header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
              Reaction Video
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Recorded on {formatDate(reaction.createdAt)} &bull; {formatDuration(reaction.duration)}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
            
            <DownloadButton
              reactionId={reaction.id}
              fileName={`reaction_${reaction.id}.webm`}
              size="sm"
            />
          </div>
        </div>
        
        {/* Message summary (if provided) */}
        {messageSummary && (
          <div className="mb-4 rounded-md bg-neutral-50 p-3 dark:bg-neutral-700">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              In response to:
            </h3>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {messageSummary}
            </p>
          </div>
        )}
        
        {/* Video player */}
        <div className="overflow-hidden rounded-lg">
          <VideoPlayer
            src={reaction.videoUrl}
            poster={reaction.thumbnailUrl}
            autoPlay={isPlaying}
            onError={(error) => console.error('Video error:', error)}
          />
        </div>
        
        {/* Action buttons */}
        <div className="mt-4 flex justify-between">
          <Button
            variant="outline"
            leftIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                {isPlaying ? (
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
            }
            onClick={handlePlayToggle}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          
          {onDeleteReaction && (
            <Button
              variant="danger"
              leftIcon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              onClick={handleOpenDeleteModal}
            >
              Delete Reaction
            </Button>
          )}
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Delete Reaction"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={handleCloseDeleteModal}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-neutral-600 dark:text-neutral-300">
          Are you sure you want to delete this reaction? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default ReactionViewer;