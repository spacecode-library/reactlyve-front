export interface Message {
  id: string;
  userId?: string;
  senderId?: string;
  content: string;
  imageUrl?: string;
  hasPasscode?: boolean;
  requiresPasscode?: boolean;
  shareableLink?: string;
  link?: string;
  url?: string;
  viewCount?: number;
  viewed?: boolean;
  createdAt: string;
  updatedAt?: string;
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