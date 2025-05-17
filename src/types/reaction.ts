import type { Reply } from './message';

    export interface Reaction {
      id: string;
      messageId: string;
      videoUrl: string;
      thumbnailUrl?: string;
      duration: number;
      createdAt: string;
      updatedAt: string;
      replies?: Reply[];
    }
  
  export interface ReactionUploadData {
    messageId: string;
    video: Blob;
  }
