import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { format } from 'date-fns';
import { DownloadIcon } from 'lucide-react';
import { reactionsApi, messagesApi } from '@/services/api';
import type { Reaction } from '@/types/reaction';
import type { MessageWithReactions } from '@/types/message';

const Reaction: React.FC = () => {
  const { reactionId } = useParams<{ reactionId: string }>();
  const [reaction, setReaction] = useState<Reaction & { replies?: any[] } | null>(null);
  const [message, setMessage] = useState<MessageWithReactions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!reactionId) return;

      try {
        const reactionRes = await reactionsApi.getById(reactionId);
        setReaction(reactionRes.data);

        const messageId = reactionRes.data.messageId || reactionRes.data.message?.id;
        if (messageId) {
          const messageRes = await messagesApi.get(messageId);
          setMessage(messageRes.data);
        }

        window.scrollTo(0, 0); // scroll to top
      } catch (err) {
        console.error(err);
        setError('Failed to load reaction or message data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Build filename using the same logic as the message page
  const prefix = 'Reactlyve';
  const titlePart = message?.content
    ? message.content.replace(/\s+/g, '_').substring(0, 5)
    : 'video';
  const responderName = reaction.name ? reaction.name.replace(/\s+/g, '_') : 'UnknownResponder';
  const datePart = format(new Date(reaction.createdAt), 'ddMMyyyy-HHmm');

  let extension = 'mp4';
  try {
    const path = new URL(reaction.videourl).pathname;
    const lastSegment = path.substring(path.lastIndexOf('/') + 1);
    if (lastSegment.includes('.')) {
      const ext = lastSegment.split('.').pop();
      if (ext) extension = ext;
    }
  } catch (err) {
    console.warn('Could not parse extension from URL:', err);
  }

  const rawFilename = `${prefix}-${titlePart}-${responderName}-${datePart}`;
  const sanitizedFilename = rawFilename.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  const finalFilename = `${sanitizedFilename}.${extension}`;

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
            onClick={() => downloadVideo(reaction.videourl, finalFilename)}
            className="mt-4 flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <DownloadIcon size={16} />
            Download Reaction
          </button>
        </div>
      ) : (
        <p className="mt-4 text-center text-neutral-600 dark:text-neutral-400">No video attached to this reaction.</p>
      )}

      {/* Replies */}
      {reaction.replies && reaction.replies.length > 0 && (
        <div className="mx-auto max-w-2xl px-4 pt-4">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-neutral-800">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Replies</h2>
            <ul className="space-y-2">
              {reaction.replies.map(reply => (
                <li
                  key={reply.id}
                  className="border-b border-neutral-200 dark:border-neutral-700 pb-2 text-sm text-neutral-800 dark:text-neutral-300"
                >
                  “{reply.text}”{' '}
                  <span className="text-xs text-neutral-500">
                    ({new Date(reply.createdAt).toLocaleString()})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Reaction;