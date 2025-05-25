import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { format } from 'date-fns';
import { DownloadIcon } from 'lucide-react';
import { reactionsApi } from '@/services/api';

const Reaction: React.FC = () => {
  const { reactionId } = useParams<{ reactionId: string }>();
  const [reaction, setReaction] = useState<{
    id: string;
    name?: string;
    videourl?: string;
    thumbnailurl?: string;
    createdAt: string;
    message?: { content?: string };
    replies?: { id: string; text: string; createdAt: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reactionId) return;

    reactionsApi.getById(reactionId)
      .then(res => {
        setReaction(res.data);
      })
      .catch(() => {
        setError('Failed to load reaction');
      })
      .finally(() => {
        setLoading(false);
      });
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

  // Build filename
  const prefix = 'Reactlyve';
  const titlePart = reaction.message?.content?.replace(/\s+/g, '_').substring(0, 5) || 'video';
  const responderNamePart = reaction.name ? reaction.name.replace(/\s+/g, '_') : 'UnknownResponder';
  let dateTimePart = 'timestamp';
  try {
    dateTimePart = format(new Date(reaction.createdAt), 'ddMMyyyy-HHmm');
  } catch (e) {
    console.error('Error formatting date for filename:', e);
  }

  let extension = 'mp4';
  try {
    const urlPath = new URL(reaction.videourl || '').pathname;
    const lastSegment = urlPath.substring(urlPath.lastIndexOf('/') + 1);
    if (lastSegment.includes('.')) {
      const ext = lastSegment.split('.').pop();
      if (ext) extension = ext;
    }
  } catch (e) {
    console.error('Could not parse video URL for extension:', e);
  }

  const nameWithoutExtension = `${prefix}-${titlePart}-${responderNamePart}-${dateTimePart}`;
  const sanitizedName = nameWithoutExtension.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  const filename = `${sanitizedName}.${extension}`;

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

      {reaction.videourl ? (
        <div className="mx-auto max-w-5xl px-4 py-8">
          <video
            src={reaction.videourl}
            controls
            poster={reaction.thumbnailurl || undefined}
            className="w-full aspect-video rounded-lg object-contain"
          />
          <button
            onClick={() => downloadVideo(reaction.videourl!, filename)}
            className="mt-4 flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <DownloadIcon size={16} />
            Download Video
          </button>
        </div>
      ) : (
        <p className="mt-4 text-center text-neutral-600 dark:text-neutral-400">
          No video attached to this reaction.
        </p>
      )}

      {reaction.replies && reaction.replies.length > 0 && (
        <div className="mx-auto max-w-5xl px-4 py-6 border-t border-neutral-200 dark:border-neutral-600">
          <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">Replies</h3>
          <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            {reaction.replies.map(reply => (
              <li key={reply.id} className="border-b pb-1 border-neutral-200 dark:border-neutral-600">
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

export default Reaction;