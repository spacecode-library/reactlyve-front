export interface Message {
    id: string;
    userId: string;
    content: string;
    imageUrl?: string;
    hasPasscode: boolean;
    shareableLink: string;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface MessageFormData {
    message: string;
    image?: File | null;
    hasPasscode: boolean;
    passcode?: string;
  }
  
  export interface MessageWithReactions extends Message {
    reactions: {
      id: string;
      createdAt: string;
      thumbnailUrl?: string;
    }[];
  }