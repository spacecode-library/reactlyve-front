import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { formatDistance } from 'date-fns';
import { ClipboardIcon, DownloadIcon, CopyIcon, LinkIcon } from 'lucide-react';
import api from '@/services/api';
import { MESSAGE_ROUTES } from '@/components/constants/apiRoutes';
import type { MessageWithReactions } from '../types/message';

const Message: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState<MessageWithReactions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<{ passcode: boolean; link: boolean }>({
    passcode: false,
    link: false,
  });

  useEffect(() => {
    const fetchMessageDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(MESSAGE_ROUTES.GET_BY_ID(id!));
        if (!response.data) {
          throw new Error('No message found');
        }
        setMessage(response.data);
      } catch (err) {
        setError('Failed to load message details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMessageDetails();
  }, [id]);

  const copyToClipboard = (text: string | undefined, type: 'passcode' | 'link') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [type]: false }));
    }, 2000);
  };
  

  const downloadVideo = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      formattedDate: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      timeAgo: formatDistance(date, new Date(), { addSuffix: true }),
    };
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

  if (error || !message) {
    return (
      <MainLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Error</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              {error || 'Message not found'}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { formattedDate, timeAgo } = formatDate(message.createdAt);

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-neutral-800">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6 border-b border-neutral-200 pb-4 dark:border-neutral-700">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Message Details
              </h1>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {formattedDate} ({timeAgo})
              </p>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                Message Content
              </h2>
              <div className="rounded-md bg-neutral-100 p-4 dark:bg-neutral-700">
                <p className="text-neutral-700 dark:text-neutral-200">{message.content}</p>
              </div>
            </div>

            {/* Media */}
            {message.imageUrl && (
              <div className="mb-6">
                <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                  {message.mediatype === 'video' ? 'Video' : 'Image'}
                </h2>
                <div className="overflow-hidden rounded-lg">
                  {message.mediatype === 'video' ? (
                    <video
                      src={message.imageUrl}
                      controls
                      className="w-full max-w-lg"
                      poster={message.thumbnailUrl || undefined}
                    />
                  ) : (
                    <img
                      src={message.imageUrl}
                      alt="Message attachment"
                      className="w-full max-w-lg object-cover"
                    />
                  )}
                </div>
                {message.mediatype === 'video' && (
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        downloadVideo(message.imageUrl, 'message-video.mp4')
                      }
                      className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      <DownloadIcon size={16} />
                      Download Video
                    </button>
                    {message.duration && (
                      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                        Duration: {Math.floor(message.duration / 60)}:
                        {(message.duration % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Shareable Link & Passcode */}
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              {message.shareableLink ? (
                <div>
                  <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                    Shareable Link
                  </h2>
                  <div className="flex items-center gap-2 rounded-md bg-neutral-100 p-3 dark:bg-neutral-700">
                    <p className="flex-1 truncate text-sm text-neutral-700 dark:text-neutral-300">
                      {message.shareableLink}
                    </p>
                    <button
                      onClick={() => copyToClipboard(message.shareableLink, 'link')}
                      className="flex items-center justify-center rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700"
                      title="Copy link"
                    >
                      {copied.link ? <ClipboardIcon size={16} /> : <CopyIcon size={16} />}
                    </button>
                  </div>
                  {copied.link && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                      Link copied to clipboard!
                    </p>
                  )}
                </div>
              ) : null}
              {message.passcode && (
                <div>
                  <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                    Passcode
                  </h2>
                  <div className="flex items-center gap-2 rounded-md bg-neutral-100 p-3 dark:bg-neutral-700">
                    <p className="flex-1 text-sm font-mono text-neutral-700 dark:text-neutral-300">
                      {message.passcode}
                    </p>
                    <button
                      onClick={() => copyToClipboard(message.passcode!, 'passcode')}
                      className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700"
                    >
                      {copied.passcode ? (
                        <ClipboardIcon size={16} />
                      ) : (
                        <CopyIcon size={16} />
                      )}
                    </button>
                  </div>
                  {copied.passcode && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                      Passcode copied to clipboard!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 ? (
              <div className="mb-6">
                <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                  Reactions
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {message.reactions.map((reaction) => (
                    <div
                      key={reaction.id}
                      className="rounded-md bg-neutral-100 p-4 dark:bg-neutral-700"
                    >
                      <p className="mb-2 text-sm text-neutral-700 dark:text-neutral-300">
                        Received on {new Date(reaction.createdAt).toLocaleString()}
                      </p>
                      <video
                        src={reaction.videoUrl}
                        controls
                        className="w-full rounded"
                        poster={reaction.thumbnailUrl || undefined}
                      />
                      <button
                        onClick={() =>
                          downloadVideo(reaction.videoUrl, `reaction-${reaction.id}.mp4`)
                        }
                        className="mt-3 flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                      >
                        <DownloadIcon size={16} />
                        Download Reaction
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6 rounded-md bg-neutral-100 p-5 text-center dark:bg-neutral-700">
                <p className="mb-3 text-neutral-700 dark:text-neutral-300">
                  Share this link with your friend to capture their reaction!
                </p>
                {message.shareableLink && (
                  <button
                    onClick={() => copyToClipboard(message.shareableLink, 'link')}
                    className="mx-auto flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    <LinkIcon size={16} />
                    <span>Copy Shareable Link</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Message;
