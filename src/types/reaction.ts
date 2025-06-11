import type { Reply } from './message';

    export interface Reaction {
      id: string;
      messageId: string;
      videoUrl: string;
      thumbnailUrl?: string;
    duration: number;
  name?: string;
    createdAt: string;
    updatedAt: string;
    moderation_status?: string | null;
    moderation_details?: string | null;
    replies?: Reply[];
  }
  
  export interface ReactionUploadData {
    messageId: string;
    video: Blob;
  name?: string;
  }

