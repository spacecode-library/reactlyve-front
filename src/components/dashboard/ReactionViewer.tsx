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
  onClose?: () => void;
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
            {reaction.name && <span className="font-semibold">{reaction.name} • </span>}
            {formatDate(reaction.createdAt)} • {formatDuration(reaction.duration)}
          </p>
        </div>

        <div className="flex space-x-2">
          {reaction.videoUrl && (
            <>
              <Button size="sm" variant="outline" onClick={handlePlayToggle}>
                {isPlaying ? 'Pause' : 'Play'}
              </Button>

              <a
                href={reaction.videoUrl}
                download={`reaction-${reaction.id}.${reaction.videoUrl.split('.').pop() || 'webm'}`}
                className="btn btn-outline btn-sm"
              >
                Download
              </a>
            </>
          )}

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
      {reaction.videoUrl ? (
        <div className="overflow-hidden rounded-md">
          <VideoPlayer
            src={reaction.videoUrl}
            poster={reaction.thumbnailUrl}
            autoPlay={isPlaying}
            onError={(err) => console.error('Video error:', err)}
          />
        </div>
      ) : (
        reaction.replies && reaction.replies.length > 0 && (
          <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-700">
            <h3 className="mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Replies:
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              {reaction.replies.map((reply, index) => (
                <li key={index} className="text-sm text-neutral-700 dark:text-neutral-300">
                  {reply}
                </li>
              ))}
            </ul>
          </div>
        )
      )}

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
