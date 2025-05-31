// src/utils/normalizeKeys.ts

export const normalizeMessage = (message: any) => {
  if (!message) return message;

  const mediaType = message.mediaType || message.mediatype;
  const rawImageUrl = message.imageUrl || message.imageurl;
  const rawVideoUrl = message.videoUrl || message.videourl;

  let finalImageUrl;
  let finalVideoUrl;

  if (mediaType === 'video') {
    finalVideoUrl = rawImageUrl;
    finalImageUrl = null;
    if (message.videoUrl || message.videourl) {
      // Prioritising rawImageUrl for video as per issue
    }
  } else {
    finalImageUrl = rawImageUrl;
    finalVideoUrl = rawVideoUrl;
  }

  return {
    ...message,
    id: message.id,
    content: message.content,
    mediaType: mediaType,
    imageUrl: finalImageUrl,
    videoUrl: finalVideoUrl,
    thumbnailUrl: message.thumbnailUrl || message.thumbnailurl,
    createdAt: message.createdAt || message.createdat,
    updatedAt: message.updatedAt || message.updatedat,
    passcode: message.passcode,
    senderId: message.senderId || message.senderid,
    shareableLink: message.shareableLink || message.shareablelink,
    fileSizeInBytes: message.fileSizeInBytes || message.mediaSize || message.file_size || undefined,
    reaction_length: message.reaction_length !== undefined ? message.reaction_length : message.reactionLength,
    reactions: (message.reactions || []).map(normalizeReaction),
    passcodeVerified: message.passcodeVerified || false,
  };
};

export const normalizeReaction = (reaction: any) => {
  if (!reaction) return reaction;
  console.log('[normalizeReaction] Raw input:', JSON.stringify(reaction));

  return {
    ...reaction,
    id: reaction.id,
    name: reaction.name,
    createdAt: reaction.createdAt || reaction.createdat,
    updatedAt: reaction.updatedAt || reaction.updatedat,
    videoUrl: reaction.videoUrl || reaction.videourl,
    thumbnailUrl: reaction.thumbnailUrl || reaction.thumbnailurl,
    duration: reaction.duration || reaction.videoDuration || reaction.video_duration || undefined,
    replies: reaction.replies || [],
  };
};
