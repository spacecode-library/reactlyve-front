// src/utils/normalizeKeys.ts

export const normalizeMessage = (message: any) => {
  if (!message) return message;

  return {
    ...message,
    id: message.id,
    content: message.content,
    mediaType: message.mediaType || message.mediatype,
    imageUrl: message.imageUrl || message.imageurl,
    videoUrl: message.videoUrl || message.videourl,
    thumbnailUrl: message.thumbnailUrl || message.thumbnailurl,
    createdAt: message.createdAt || message.createdat,
    updatedAt: message.updatedAt || message.updatedat,
    passcode: message.passcode,
    senderId: message.senderId || message.senderid,
    shareableLink: message.shareableLink || message.shareablelink,
    reactions: message.reactions || [],
    passcodeVerified: message.passcodeVerified || false,
  };
};
