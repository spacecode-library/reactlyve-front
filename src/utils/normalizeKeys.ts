// src/utils/normalizeKeys.ts

export const normalizeMessage = (message: any) => {
  if (!message) return message;

  const mediaType = message.mediaType || message.mediatype;
  const rawImageUrl = message.imageUrl || message.imageurl;
  const rawVideoUrl = message.videoUrl || message.videourl; // This might be null if backend stores video links in imageurl

  let finalImageUrl;
  let finalVideoUrl;

  if (mediaType === 'video') {
    finalVideoUrl = rawImageUrl; // Video URLs are in imageurl field as per issue
    finalImageUrl = null;        // Clear imageUrl if it's a video
    // If there's a rawVideoUrl from the backend for a video, it's ambiguous.
    // Prioritizing rawImageUrl as per the issue description.
    // If rawVideoUrl also exists and is the correct one, this logic might need adjustment,
    // but the issue says the video URL is in imageurl.
    if (message.videoUrl || message.videourl) {
        // This case indicates that the backend might be providing both imageurl and videourl for mediaType video.
        // Based on the issue, the URL in imageurl is the one to be used for video.
        // So, we stick to finalVideoUrl = rawImageUrl;
        // We could add a log here if this condition is met, for debugging purposes.
    }
  } else { // Presumably mediaType is 'image' or undefined
    finalImageUrl = rawImageUrl;
    finalVideoUrl = rawVideoUrl; // Preserve videoUrl if it exists for non-video types (though unlikely)
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
    reactions: message.reactions || [],
    passcodeVerified: message.passcodeVerified || false,
    // Ensure other potential lowercase properties are also normalized if necessary,
    // though the main focus is imageUrl and videoUrl for this task.
  };
};
