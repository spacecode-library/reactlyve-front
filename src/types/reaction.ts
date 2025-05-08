export interface Reaction {
    id: string;
    messageId: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ReactionUploadData {
    messageId: string;
    video: Blob;
  }