import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { formatDistance, format } from 'date-fns'; // Added format
import { ClipboardIcon, DownloadIcon, CopyIcon, LinkIcon, Trash2Icon } from 'lucide-react';
import api, { messagesApi, reactionsApi } from '@/services/api';
import { MESSAGE_ROUTES } from '@/components/constants/apiRoutes';
import type { MessageWithReactions } from '../types/message';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';
import type { Reaction } from '../types/reaction';
import { normalizeMessage } from '../utils/normalizeKeys';
import { QRCodeSVG } from 'qrcode.react';

const Message: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteReactionModal, setShowDeleteReactionModal] = useState(false);
  const [reactionToDeleteId, setReactionToDeleteId] = useState<string | null>(null);
  const [isDeletingReaction, setIsDeletingReaction] = useState(false);
  const [showDeleteAllReactionsModal, setShowDeleteAllReactionsModal] = useState(false);
  const [isDeletingAllReactions, setIsDeletingAllReactions] = useState(false);
  const [message, setMessage] = useState<MessageWithReactions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState({ passcode: false, link: false });
  const [showQrCode, setShowQrCode] = useState(false);

  useEffect(() => {
    const fetchMessageDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(MESSAGE_ROUTES.GET_BY_ID(id!));
        if (!response.data) throw new Error('No message found');
        setMessage(response.data);
        console.log('🔍 Message data from API:', response.data);
      } catch (err) {
        setError('Failed to load message details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMessageDetails();
  }, [id]);

  // Scroll to top when message details are loaded
  useEffect(() => {
    if (message) {
      window.scrollTo(0, 0);
    }
  }, [message]);

  const handleDeleteMessage = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await messagesApi.delete(id);
      toast.success('Message deleted successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to delete message. Please try again.');
      console.error('Error deleting message:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmModal(false);
    }
  };

  const handleDeleteSingleReaction = async () => {
    if (!reactionToDeleteId) return;
    setIsDeletingReaction(true);
    try {
      await reactionsApi.deleteReactionById(reactionToDeleteId);
      setMessage(prevMessage => {
        if (!prevMessage || !prevMessage.reactions) return prevMessage;
        return {
          ...prevMessage,
          reactions: prevMessage.reactions.filter(reaction => reaction.id !== reactionToDeleteId),
        };
      });
      toast.success('Reaction deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete reaction. Please try again.');
      console.error('Error deleting reaction:', err);
    } finally {
      setIsDeletingReaction(false);
      setShowDeleteReactionModal(false);
      setReactionToDeleteId(null);
    }
  };

  const openDeleteReactionModal = (rId: string) => {
    setReactionToDeleteId(rId);
    setShowDeleteReactionModal(true);
  };

  const handleDeleteAllReactions = async () => {
    if (!id) return; // id is the messageId from useParams
    setIsDeletingAllReactions(true);
    try {
      await reactionsApi.deleteAllForMessage(id);
      setMessage(prevMessage => {
        if (!prevMessage) return null;
        return {
          ...prevMessage,
          reactions: [], // Set reactions to an empty array
        };
      });
      toast.success('All reactions for this message deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete all reactions. Please try again.');
      console.error('Error deleting all reactions:', err);
    } finally {
      setIsDeletingAllReactions(false);
      setShowDeleteAllReactionsModal(false);
    }
  };
  
  const normalizedMessage = normalizeMessage(message);
  
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

  // Removed getQrCodeUrl function

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
  
  const hasReactions = message.reactions && message.reactions.length > 0;

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-neutral-800">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-neutral-200 pb-4 dark:border-neutral-700">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Message Details</h1>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {formattedDate} ({timeAgo})
                </p>
              </div>
              {message && !loading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirmModal(true)}
                  disabled={isDeleting}
                  leftIcon={<Trash2Icon size={16} />}
                >
                  Delete Message
                </Button>
              )}
            </div>

            {/* Message content */}
            <div className="mb-6">
              <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">Message Content</h2>
              <div className="rounded-md bg-neutral-100 p-4 dark:bg-neutral-700">
                <p className="text-neutral-700 dark:text-neutral-200">{message.content}</p>
              </div>
            </div>

            {/* Media */}
            {normalizedMessage.mediaType === 'image' && normalizedMessage.imageUrl && (
              <div className="mb-6">
                <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">Image</h2>
                <img src={normalizedMessage.imageUrl} alt="Message" className="w-full max-w-lg rounded object-cover" />
              </div>
            )}
            {normalizedMessage.mediaType === 'video' && normalizedMessage.videoUrl && (
              <div className="mb-6">
                <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">Video</h2>
                <video src={normalizedMessage.videoUrl} controls poster={normalizedMessage.thumbnailUrl} className="w-full max-w-lg" />
                <div className="mt-3">
                  <button
                    onClick={() => downloadVideo(normalizedMessage.videoUrl!, 'message-video.mp4')}
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    <DownloadIcon size={16} />
                    Download Video
                  </button>
                  {message.duration && (
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                      Duration: {Math.floor(message.duration / 60)}:{(message.duration % 60).toString().padStart(2, '0')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Shareable link and passcode */}
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              {normalizedMessage.shareableLink && (
                <div>
                  <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">Shareable Link</h2>
                  <div className="flex items-center gap-2 rounded-md bg-neutral-100 p-3 dark:bg-neutral-700">
                    <p className="flex-1 truncate text-sm text-neutral-700 dark:text-neutral-300">
                      {normalizedMessage.shareableLink}
                    </p>
                    <button
                      onClick={() => copyToClipboard(normalizedMessage.shareableLink, 'link')}
                      className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700"
                    >
                      {copied.link ? <ClipboardIcon size={16} /> : <CopyIcon size={16} />}
                    </button>
                    <button
                      onClick={() => setShowQrCode(!showQrCode)}
                      className="ml-2 rounded-md bg-green-600 p-2 text-white hover:bg-green-700"
                    >
                      {showQrCode ? 'Hide QR' : 'Show QR'}
                    </button>
                  </div>
                  {copied.link && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">Link copied to clipboard!</p>
                  )}
                  {showQrCode && normalizedMessage.shareableLink && (
                    <div className="mt-4 text-center">
                      <h3 className="mb-2 text-md font-semibold text-neutral-900 dark:text-white">Scan QR Code</h3>
                      <div className="inline-block rounded-lg bg-white p-4 shadow"> {/* Increased padding slightly for aesthetics */}
                        <QRCodeSVG
                          value={normalizedMessage.shareableLink}
                          size={200} // Adjust size as needed
                          bgColor={"#ffffff"}
                          fgColor={"#000000"}
                          level={"L"} // Error correction level
                        />
                      </div>
                      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                        Scan this QR code to access the shareable link.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {message.passcode && (
                <div>
                  <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">Passcode</h2>
                  <div className="flex items-center gap-2 rounded-md bg-neutral-100 p-3 dark:bg-neutral-700">
                    <p className="flex-1 text-sm font-mono text-neutral-700 dark:text-neutral-300">
                      {message.passcode}
                    </p>
                    <button
                      onClick={() => copyToClipboard(message.passcode, 'passcode')}
                      className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700"
                    >
                      {copied.passcode ? <ClipboardIcon size={16} /> : <CopyIcon size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Reactions and Replies */}
            {hasReactions ? (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Reactions</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteAllReactionsModal(true)}
                    disabled={isDeletingAllReactions || !message?.reactions?.length}
                    isLoading={isDeletingAllReactions}
                    className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/30"
                  >
                    <Trash2Icon size={16} className="mr-1" />
                    Clear All Reactions
                  </Button>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {message.reactions.map((reaction: Reaction & { name?: string; videourl?: string; thumbnailurl?: string; replies?: { id: string; text: string; createdAt: string }[] }) => (
                    <div key={reaction.id} className="rounded-md bg-neutral-100 p-4 dark:bg-neutral-700">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          {reaction.name && (
                            <p className="text-md font-semibold text-neutral-800 dark:text-neutral-100">
                              From: {reaction.name}
                            </p>
                          )}
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">
                            Received on {new Date(reaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteReactionModal(reaction.id)}
                          className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:text-neutral-400 dark:hover:text-red-500 dark:hover:bg-red-900/30"
                          disabled={isDeletingReaction && reactionToDeleteId === reaction.id}
                          isLoading={isDeletingReaction && reactionToDeleteId === reaction.id}
                          title="Delete Reaction"
                        >
                          <Trash2Icon size={16} />
                        </Button>
                      </div>

                      {reaction.videourl ? (
                        <>
                          <video src={reaction.videourl} controls poster={reaction.thumbnailurl || undefined} className="w-full rounded" />
                          <button
                            onClick={() => {
                              if (!reaction.videourl) {
                                console.error("Download clicked but no videourl present for reaction:", reaction.id);
                                return;
                              }

                              // 1. Prefix
                              const prefix = "Reactlyve";

                              // 2. Message Title Part
                              let titlePart = "video"; // Default if message.content is unavailable
                              if (message && message.content) {
                                titlePart = message.content.replace(/\s+/g, '_').substring(0, 5);
                              }
                              
                              // 3. Responder Name Part
                              const responderNamePart = reaction.name ? reaction.name.replace(/\s+/g, '_') : "UnknownResponder";

                              // 4. Date/Time Part
                              let dateTimePart = "timestamp"; // Default
                              if (reaction.createdAt) {
                                try {
                                  dateTimePart = format(new Date(reaction.createdAt), 'ddMMyyyy-HHmm');
                                } catch (e) {
                                  console.error("Error formatting date for filename:", e);
                                }
                              }

                              // 5. File Extension Part
                              let extension = "video"; // Default extension
                              try {
                                const urlPath = new URL(reaction.videourl).pathname;
                                const lastSegment = urlPath.substring(urlPath.lastIndexOf('/') + 1);
                                if (lastSegment.includes('.')) {
                                  const ext = lastSegment.split('.').pop();
                                  if (ext) extension = ext;
                                }
                              } catch (e) {
                                console.error("Could not parse video URL for extension:", e);
                              }

                              const nameWithoutExtension = `${prefix}-${titlePart}-${responderNamePart}-${dateTimePart}`;
                              const sanitizedName = nameWithoutExtension.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
                              const finalFilename = `${sanitizedName}.${extension}`;

                              downloadVideo(reaction.videourl, finalFilename);
                            }}
                            className="mt-3 flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                          >
                            <DownloadIcon size={16} />
                            Download Reaction
                          </button>
                        </>
                      ) : (
                        (!reaction.replies || reaction.replies.length === 0) && (
                          <p className="my-4 text-sm text-neutral-600 dark:text-neutral-400">
                            No reaction video recorded or replies.
                          </p>
                        )
                      )}
                      
                      {/* Replies */}
                      {reaction.replies && reaction.replies.length > 0 && (
                        <div className="mt-4 border-t pt-3 border-neutral-300 dark:border-neutral-600">
                          <h4 className="mb-1 text-sm font-semibold text-neutral-900 dark:text-white">Replies:</h4>
                          <ul className="space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
                            {reaction.replies.map(reply => (
                              <li key={reply.id} className="border-b pb-1 border-neutral-200 dark:border-neutral-600">
                                “{reply.text}” <span className="text-xs text-neutral-500">({new Date(reply.createdAt).toLocaleString()})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6 rounded-md bg-neutral-100 p-5 text-center dark:bg-neutral-700">
                <p className="mb-3 text-neutral-700 dark:text-neutral-300">
                  Share this link with your friend to capture their reaction!
                </p>
                {normalizedMessage.shareableLink && (
                  <button
                    onClick={() => copyToClipboard(normalizedMessage.shareableLink, 'link')}
                    className="mx-auto flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    <LinkIcon size={16} />
                    Copy Shareable Link
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <Modal
          isOpen={showDeleteConfirmModal}
          onClose={() => setShowDeleteConfirmModal(false)}
          title="Delete Message"
          size="sm"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowDeleteConfirmModal(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteMessage} disabled={isDeleting} isLoading={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Message'}
              </Button>
            </>
          }
        >
          <p className="text-neutral-600 dark:text-neutral-300">
            Are you sure you want to delete this message? This action will also delete all associated reactions and cannot be undone.
          </p>
        </Modal>
        <Modal
          isOpen={showDeleteReactionModal}
          onClose={() => {
            setShowDeleteReactionModal(false);
            setReactionToDeleteId(null); 
          }}
          title="Delete Reaction"
          size="sm"
          footer={
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteReactionModal(false);
                  setReactionToDeleteId(null);
                }} 
                disabled={isDeletingReaction}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDeleteSingleReaction} 
                disabled={isDeletingReaction} 
                isLoading={isDeletingReaction}
              >
                {isDeletingReaction ? 'Deleting...' : 'Delete Reaction'}
              </Button>
            </>
          }
        >
          <p className="text-neutral-600 dark:text-neutral-300">
            Are you sure you want to delete this specific reaction? This action cannot be undone.
          </p>
        </Modal>
        <Modal
          isOpen={showDeleteAllReactionsModal}
          onClose={() => setShowDeleteAllReactionsModal(false)}
          title="Clear All Reactions"
          size="sm"
          footer={
            <>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteAllReactionsModal(false)} 
                disabled={isDeletingAllReactions}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDeleteAllReactions} 
                disabled={isDeletingAllReactions} 
                isLoading={isDeletingAllReactions}
              >
                {isDeletingAllReactions ? 'Clearing...' : 'Clear All'}
              </Button>
            </>
          }
        >
          <p className="text-neutral-600 dark:text-neutral-300">
            Are you sure you want to delete ALL reactions for this message? This action cannot be undone.
          </p>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default Message;
