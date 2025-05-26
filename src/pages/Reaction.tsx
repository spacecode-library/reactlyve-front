import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { format } from 'date-fns';
import { DownloadIcon } from 'lucide-react';
import { reactionsApi, messagesApi } from '@/services/api';
import VideoPlayer from '../components/dashboard/VideoPlayer';
import type { MessageWithReactions } from '@/types/message';
import type { Reaction } from '@/types/reaction';

const ReactionPage: React.FC = () => {
  const { reactionId } = useParams<{ reactionId: string }>();
  const [reaction, setReaction] = useState<Reaction & { replies?: any[] } | null>(null);
  const [parentMessage, setParentMessage] = useState<MessageWithReactions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReactionAndMessage = async () => {
      try {
        if (!reactionId) return;

        const reactionRes = await reactionsApi.getById(reactionId);

        let fetchedData = reactionRes.data;
        if (fetchedData) {
          fetchedData = {
            ...fetchedData,
            videoUrl: (fetchedData as any).videourl,
            thumbnailUrl: (fetchedData as any).thumbnailurl,
            messageId: (fetchedData as any).messageid // Add messageId mapping
          };
          // Clean up the original lowercase keys if they exist
          if ((fetchedData as any).videourl !== undefined) {
            delete (fetchedData as any).videourl;
          }
          if ((fetchedData as any).thumbnailurl !== undefined) {
            delete (fetchedData as any).thumbnailurl;
          }
          if ((fetchedData as any).messageid !== undefined) { // Delete original messageid
            delete (fetchedData as any).messageid;
          }
        }

        setReaction(fetchedData);

        // Fetch the parent message if available
        if (fetchedData?.messageId) {
          const messageRes = await messagesApi.getById(fetchedData.messageId);
          const fetchedParentMessage = messageRes.data;
          setParentMessage(fetchedParentMessage);

          if (fetchedParentMessage?.reactions) {
            const reactionFromParent = fetchedParentMessage.reactions.find(
              (r: Reaction) => r.id === (fetchedData?.id || reactionId)
            );

            if (reactionFromParent && reactionFromParent.replies) {
              setReaction(prevReaction => {
                if (!prevReaction) return null; // Should not happen if fetchedData was set
                return {
                  ...prevReaction,
                  replies: reactionFromParent.replies,
                };
              });
            }
          }
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

  const downloadVideo = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const getDownloadFilename = () => {
    let extension = 'mp4';
    try {
      if (reaction?.videoUrl) {
        const urlPath = new URL(reaction.videoUrl).pathname;
        const lastSegment = urlPath.substring(urlPath.lastIndexOf('/') + 1);
        if (lastSegment.includes('.')) {
          const ext = lastSegment.split('.').pop();
          if (ext) {
            extension = ext;
          }
        }
      }
    } catch (e) {
      console.error('Could not parse video URL for extension:', e);
      // Default to 'mp4' if parsing fails
    }

    if (reaction?.id) {
      return `reaction-${reaction.id}.${extension}`;
    }
    return `reaction_video.${extension}`;
  };

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

  const formattedDate = format(new Date(reaction.createdAt), 'dd MMM yyyy, HH:mm');

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-neutral-800">
          <h1 className="mb-4 text-2xl font-bold text-neutral-900 dark:text-white">Reaction Details</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{formattedDate}</p>

          {reaction.name && (
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              <strong>From:</strong> {reaction.name}
            </p>
          )}
        </div>
      </div>

      {reaction.videoUrl ? (
        <div className="px-4 py-8">
          <VideoPlayer
            src={reaction.videoUrl}
            poster={reaction.thumbnailUrl || undefined}
            className="w-full aspect-video rounded-lg object-contain"
          />
          <button
            onClick={() => downloadVideo(reaction.videoUrl!, getDownloadFilename())}
            className="mt-4 flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <DownloadIcon size={16} />
            Download Video
          </button>
        </div>
      ) : (
        <p className="mt-4 text-center text-neutral-600 dark:text-neutral-400">No video attached to this reaction.</p>
      )}

      {/* Replies */}
      {reaction.replies && reaction.replies.length > 0 && (
        <div className="mx-auto max-w-3xl px-4 py-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Replies</h2>
          <ul className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
            {reaction.replies.map(reply => (
              <li key={reply.id} className="border-b pb-2 border-neutral-200 dark:border-neutral-600">
                “{reply.text}”{' '}
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