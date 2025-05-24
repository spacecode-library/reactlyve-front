import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { format } from 'date-fns';
import { DownloadIcon } from 'lucide-react';
import { reactionsApi } from '@/services/api';

const Reaction: React.FC = () => {
  const { reactionId } = useParams<{ reactionId: string }>();
  const [reaction, setReaction] = useState<any>(null);
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
  const filename = `reaction-${reaction.name || 'anonymous'}-${reaction.id}.mp4`;

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

          {reaction.videourl ? (
            <div className="mt-6">
              <video
                src={reaction.videourl}
                controls
                poster={reaction.thumbnailurl || undefined}
                className="w-full rounded"
              />
              <button
                onClick={() => downloadVideo(reaction.videourl, filename)}
                className="mt-4 flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <DownloadIcon size={16} />
                Download Video
              </button>
            </div>
          ) : (
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">No video attached to this reaction.</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Reaction;
