import React, { useState } from 'react';
import { Reaction } from '../../types/reaction';
import { formatDate, formatDuration, truncateString } from '../../utils/formatters';
import { getTransformedCloudinaryUrl } from '../../utils/mediaHelpers';
import { classNames } from '../../utils/classNames';
import VideoPlayer from './VideoPlayer';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { reactionsApi } from '../../services/api';
import toast from 'react-hot-toast';

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
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  let transformedVideoUrl = reaction.videoUrl;
  if (reaction.videoUrl) {
    transformedVideoUrl = getTransformedCloudinaryUrl(reaction.videoUrl, 0);
  }

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
          {reaction.videoUrl && reaction.moderationStatus !== "rejected" && reaction.moderationStatus !== "manual_review" && (
            <>
              <Button size="sm" variant="outline" onClick={handlePlayToggle}>
                {isPlaying ? 'Pause' : 'Play'}
              </Button>

              <a
                href={transformedVideoUrl || '#'}
                download={`reaction-${reaction.id}.${transformedVideoUrl?.split('.').pop()?.split('?')[0] || 'webm'}`}
                className={classNames(
                  "btn btn-outline btn-sm",
                  !transformedVideoUrl && "btn-disabled opacity-50 cursor-not-allowed"
                )}
                aria-disabled={!transformedVideoUrl}
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
      {reaction.videoUrl && reaction.moderationStatus !== "rejected" && reaction.moderationStatus !== "manual_review" ? (
        <div className="overflow-hidden rounded-md">
          <VideoPlayer
            src={transformedVideoUrl || ''}
            poster={reaction.thumbnailUrl}
            autoPlay={isPlaying}
          />
        </div>
      ) : (
        reaction.replies && reaction.replies.length > 0 && (
          <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-700">
            <h3 className="mb-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Replies:
            </h3>
            <div className="space-y-2">
              {reaction.replies.map(reply => (
                <div
                  key={reply.id}
                  className="rounded-md border border-neutral-200 bg-white p-3 dark:border-neutral-600 dark:bg-neutral-700"
                >
                  {reply.mediaUrl && reply.mediaType?.startsWith('video') && (
                    <div className="mb-2 overflow-hidden rounded-md">
                      <VideoPlayer src={reply.mediaUrl} poster={reply.thumbnailUrl || undefined} />
                    </div>
                  )}
                  {reply.mediaUrl && reply.mediaType?.startsWith('audio') && (
                    <div className="mb-2">
                      <audio controls src={reply.mediaUrl} className="w-full" />
                    </div>
                  )}
                  {reply.text && (
                    <p className="text-sm text-neutral-800 dark:text-neutral-200 break-words">
                      {reply.text}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Received: {formatDate(reply.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {(reaction.moderationStatus === "rejected" || reaction.moderationStatus === "manual_review") && (
        <div className="mt-4 rounded-md bg-neutral-100 p-3 dark:bg-neutral-700">
          <p className="mb-1 break-words text-base font-medium text-neutral-500 dark:text-neutral-400">
            {reaction.moderationDetails ? `This video was rejected: ${reaction.moderationDetails}` : 'This video failed moderation.'}
          </p>
          <Button
            size="sm"
            className="mt-2"
            disabled={reaction.moderationStatus === 'manual_review'}
            onClick={async () => {
              setIsSubmittingReview(true);
              try {
                await reactionsApi.submitForManualReview(reaction.id);
                toast.success('Submitted for manual review');
              } catch (err) {
                toast.error('Failed to submit for review');
              } finally {
                setIsSubmittingReview(false);
              }
            }}
            isLoading={isSubmittingReview}
          >
            {reaction.moderationStatus === 'manual_review' ? 'Manual Review Pending' : 'Request Review'}
          </Button>
        </div>
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
