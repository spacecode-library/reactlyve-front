import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { format } from 'date-fns';
import { DownloadIcon } from 'lucide-react';
import { reactionsApi, messagesApi } from '@/services/api';
import Button from '../components/common/Button';
import VideoPlayer from '../components/dashboard/VideoPlayer';
import type { MessageWithReactions } from '@/types/message';
import type { Reaction } from '@/types/reaction';
import { normalizeReaction, normalizeMessage } from '../utils/normalizeKeys';
import { getTransformedCloudinaryUrl } from '../utils/mediaHelpers';
import toast from 'react-hot-toast'; // For user feedback

const ReactionPage: React.FC = () => {
  const { reactionId } = useParams<{ reactionId: string }>();
  const [reaction, setReaction] = useState<(Reaction & { replies?: any[] }) | null>(null);
  const [parentMessage, setParentMessage] = useState<MessageWithReactions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Define processedVideoUrl
  let processedVideoUrl: string | null | undefined = null;
  if (reaction?.videoUrl) {
    processedVideoUrl = getTransformedCloudinaryUrl(reaction.videoUrl, 0);
  } else {
    processedVideoUrl = reaction?.videoUrl; // Could be null or undefined
  }

  useEffect(() => {
    const fetchReactionAndMessage = async () => {
      try {
        if (!reactionId) return;

        const reactionRes = await reactionsApi.getById(reactionId);

        const rawReactionData = reactionRes.data;
        if (rawReactionData) {
          const normalizedReactionData = normalizeReaction(rawReactionData);
          setReaction(normalizedReactionData);

          // Fetch the parent message if available
          if (normalizedReactionData?.messageid) {
            const messageRes = await messagesApi.getById(normalizedReactionData.messageid);
            const fetchedParentMessage = messageRes.data;
            setParentMessage(fetchedParentMessage);

            if (fetchedParentMessage?.reactions) {
              // Ensure reactionFromParent check uses normalizedReactionData.id
              const reactionFromParent = fetchedParentMessage.reactions.find(
                (r: Reaction) => r.id === (normalizedReactionData?.id || reactionId)
              );

              if (reactionFromParent && reactionFromParent.replies) {
                setReaction(prevReaction => {
                  if (!prevReaction) return null;
                  return {
                    ...prevReaction,
                    replies: reactionFromParent.replies,
                  };
                });
              }
            }
          }
        } else {
          setReaction(null);
        }

        window.scrollTo(0, 0);
      } catch (err) {
        console.error(err);
        setError('Failed to load reaction');
      } finally {
        setLoading(false);
      }
    };

    fetchReactionAndMessage();
  }, [reactionId]);

  useEffect(() => {
    if (reaction) {
      console.log('Reaction URLs:', {
        videoUrl: reaction.videoUrl,
        downloadUrl: reaction.downloadUrl,
      });
      reaction.replies?.forEach(rep => {
        console.log(`Reply ${rep.id} URLs:`, {
          mediaUrl: rep.mediaUrl,
          downloadUrl: rep.downloadUrl,
        });
      });
    }
    if (parentMessage) {
      const n = normalizeMessage(parentMessage);
      console.log('Parent message URLs:', {
        imageUrl: n.imageUrl,
        videoUrl: n.videoUrl,
        downloadUrl: n.downloadUrl,
      });
    }
  }, [reaction, parentMessage]);


  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-300 border-t-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !reaction) {
    return (
      <MainLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Error</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              {error || 'Reaction not found'}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const formattedDateDisplay = reaction?.createdAt
    ? format(new Date(reaction.createdAt), 'dd MMM yyyy, HH:mm')
    : 'Date not available';

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-neutral-800">
          <h1 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">
            Reaction Details
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{formattedDateDisplay}</p>

          {reaction?.name && (
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              <strong>From:</strong> {reaction.name}
            </p>
          )}
          {(reaction?.moderationStatus === 'rejected' ||
            reaction?.moderationStatus === 'manual_review') && (
            <div className="mt-2 text-neutral-700 dark:text-neutral-300">
              <p className="mb-1 break-words text-base font-medium text-neutral-500 dark:text-neutral-400">
                {reaction.moderationDetails
                  ? `This video was rejected: ${reaction.moderationDetails}`
                  : 'This video failed moderation.'}
              </p>
              <Button
                size="sm"
                className="mt-1"
                disabled={reaction?.moderationStatus === 'manual_review'}
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
                {reaction?.moderationStatus === 'manual_review'
                  ? 'Manual Review Pending'
                  : 'Request Review'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {processedVideoUrl &&
      reaction?.moderationStatus !== 'rejected' &&
      reaction?.moderationStatus !== 'manual_review' ? (
        <div className="px-4 py-8">
          <div className="relative">
            <VideoPlayer
              src={processedVideoUrl || ''}
              poster={reaction?.thumbnailUrl || undefined}
              className="w-full aspect-video rounded-lg object-contain"
              initialDurationSeconds={
                typeof reaction?.duration === 'number' ? reaction.duration : undefined
              }
            />
            {reaction.downloadUrl && (
              <a
                href={reaction.downloadUrl}
                download
                className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white hover:bg-black"
              >
                <DownloadIcon size={20} />
                <span className="sr-only">Download Video</span>
              </a>
            )}
          </div>
        </div>
      ) : (
        reaction?.moderationStatus !== 'rejected' &&
        reaction?.moderationStatus !== 'manual_review' && (
          <p className="mt-4 text-center text-neutral-600 dark:text-neutral-400">
            No video attached to this reaction.
          </p>
        )
      )}

      {/* Replies */}
      {reaction?.replies && reaction.replies.length > 0 && (
        <div className="mx-auto max-w-3xl px-4 py-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Replies</h2>
          <ul className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
            {reaction.replies.map(reply => (
              <li
                key={reply.id}
                className="border-b pb-2 border-neutral-200 dark:border-neutral-600"
              >
                {reply.mediaUrl && (
                  <div className="mb-2 relative">
                    {reply.mediaType === 'video' ? (
                      <VideoPlayer
                        src={getTransformedCloudinaryUrl(reply.mediaUrl, 0)}
                        poster={reply.thumbnailUrl || undefined}
                        className="w-full aspect-video rounded"
                        initialDurationSeconds={
                          typeof reply.duration === 'number' ? reply.duration : undefined
                        }
                      />
                    ) : reply.mediaType === 'audio' ? (
                      <audio controls src={reply.mediaUrl} className="w-full" />
                    ) : null}
                    {reply.downloadUrl && (
                      <a
                        href={reply.downloadUrl}
                        download
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white hover:bg-black"
                      >
                        <DownloadIcon size={20} />
                        <span className="sr-only">Download</span>
                      </a>
                    )}
                  </div>
                )}
                {reply.text && <span>“{reply.text}” </span>}
                <span className="text-xs text-neutral-500">
                  ({new Date(reply.createdAt).toLocaleString()})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </MainLayout>
  );
};

export default ReactionPage;
