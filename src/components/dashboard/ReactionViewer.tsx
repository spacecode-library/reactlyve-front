import React, { useState } from 'react';
import { Reaction } from '../../types/reaction';
import { formatDate, formatDuration, truncateString } from '../../utils/formatters';
import { classNames } from '../../utils/classNames';
import VideoPlayer from './VideoPlayer';
import Button from '../common/Button';
import Modal from '../common/Modal';

interface ReactionViewerProps {
  reaction: Reaction;
  messageSummary?: string;
  onDeleteReaction?: (reactionId: string) => void;
  showCloseButton?: boolean;
  className?: string;
}

const ReactionViewer: React.FC<ReactionViewerProps> = ({
  reaction,
  messageSummary,
  onDeleteReaction,
  showCloseButton = false,
  className,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handlePlayToggle = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleOpenDeleteModal = () => setIsDeleteModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  const handleConfirmDelete = () => {
    onDeleteReaction?.(reaction.id);
    handleCloseDeleteModal();
  };

  return (
    <div className={classNames('rounded-lg bg-white p-4 shadow-sm dark:bg-neutral-800', className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            Reaction Video
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {formatDate(reaction.createdAt)} • {formatDuration(reaction.duration)}
          </p>
        </div>

        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={handlePlayToggle}>
            {isPlaying ? 'Pause' : 'Play'}
          </Button>

          <a
            href={reaction.videoUrl}
            download={`reaction-${reaction.id}.webm`}
            className="btn btn-outline btn-sm"
          >
            Download
          </a>

          {onDeleteReaction && (
            <Button
              size="sm"
              variant="danger"
              onClick={handleOpenDeleteModal}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Optional message summary */}
      {messageSummary && (
        <div className="mb-4 rounded-md bg-neutral-50 p-3 dark:bg-neutral-700">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            <strong>In response to:</strong> {truncateString(messageSummary, 100)}
          </p>
        </div>
      )}

      {/* Video */}
      <div className="overflow-hidden rounded-md">
        <VideoPlayer
          src={reaction.videoUrl}
          poster={reaction.thumbnailUrl}
          autoPlay={isPlaying}
          onError={(err) => console.error('Video error:', err)}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Delete Reaction"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseDeleteModal}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
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
