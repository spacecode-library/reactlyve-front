import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { formatDistance } from 'date-fns';
import { ClipboardIcon, DownloadIcon, CopyIcon, LinkIcon } from 'lucide-react';
import api from '@/services/api';
import { MESSAGE_ROUTES } from '@/components/constants/apiRoutes';

interface MessageDetails {
  content: string;
  createdat: string;
  imageurl: string | null;
  passcode: string | null;
  shareablelink: string;
  reactionid: string | null;
  replyurl: string | null;
  videourl: string | null;
}

const Message: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState<MessageDetails | null>(null);
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
        // Replace with your actual API endpoint
        const response = await api.get(MESSAGE_ROUTES.GET_BY_ID(id!));
        if (!response.data) {
          throw new Error('Failed to fetch message details');
        }
        const data = await response.data;
        setMessage(data);
      } catch (err) {
        setError('Error loading message details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMessageDetails();
    }
  }, [id]);

  const copyToClipboard = (text: string, type: 'passcode' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [type]: true });
    setTimeout(() => {
      setCopied({ ...copied, [type]: false });
    }, 2000);
  };

  const downloadVideo = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      formattedDate: date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
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

  const { formattedDate, timeAgo } = formatDate(message.createdat);

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-neutral-800">
          <div className="p-6">
            <div className="mb-6 border-b border-neutral-200 pb-4 dark:border-neutral-700">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                Message Details
              </h1>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {formattedDate} ({timeAgo})
              </p>
            </div>

            {/* Message Content */}
            <div className="mb-6">
              <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                Message Content
              </h2>
              <div className="rounded-md bg-neutral-100 p-4 dark:bg-neutral-700">
                <p className="text-neutral-700 dark:text-neutral-200">
                  {message.content}
                </p>
              </div>
            </div>

            {/* Message Image (if available) */}
            {message.imageurl && (
              <div className="mb-6">
                <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                  Image
                </h2>
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={message.imageurl}
                    alt="Message attachment"
                    className="h-auto w-full max-w-lg object-cover"
                  />
                </div>
              </div>
            )}

            {/* Sharable Link & Passcode */}
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              {message.shareablelink && (
                <div>
                  <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                    Shareable Link
                  </h2>
                  <div className="flex items-center gap-2 rounded-md bg-neutral-100 p-3 dark:bg-neutral-700">
                    <p className="flex-1 truncate text-sm text-neutral-700 dark:text-neutral-300">
                      {message.shareablelink}
                    </p>
                    <button
                      onClick={() => copyToClipboard(message.shareablelink, 'link')}
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
              )}

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
                      className="flex items-center justify-center rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700"
                      title="Copy passcode"
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

            {/* Reaction Downloads (if available) */}
            {message.reactionid ? (
              <div className="mb-6">
                <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                  Reaction Downloads
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {message.videourl && (
                    <div className="rounded-md bg-neutral-100 p-4 dark:bg-neutral-700">
                      <p className="mb-3 text-sm text-neutral-700 dark:text-neutral-300">
                        Download reaction video
                      </p>
                      <button
                        onClick={() =>
                          downloadVideo(message.videourl!, 'reaction-video.mp4')
                        }
                        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                      >
                        <DownloadIcon size={16} />
                        <span>Download Video</span>
                      </button>
                    </div>
                  )}

                  {message.replyurl && (
                    <div className="rounded-md bg-neutral-100 p-4 dark:bg-neutral-700">
                      <p className="mb-3 text-sm text-neutral-700 dark:text-neutral-300">
                        Download reply video
                      </p>
                      <button
                        onClick={() =>
                          downloadVideo(message.replyurl!, 'reply-video.mp4')
                        }
                        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                      >
                        <DownloadIcon size={16} />
                        <span>Download Reply</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-6 rounded-md bg-neutral-100 p-5 text-center dark:bg-neutral-700">
                <p className="mb-3 text-neutral-700 dark:text-neutral-300">
                  Share this link with your friend to capture their reaction!
                </p>
                <button
                  onClick={() => copyToClipboard(message.shareablelink, 'link')}
                  className="flex items-center gap-2 mx-auto rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <LinkIcon size={16} />
                  <span>Copy Shareable Link</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Message;