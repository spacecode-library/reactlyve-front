export interface Message {
  id: string;
  userId?: string;
  senderId: string;
  content: string;
  imageUrl: string;
  hasPasscode?: boolean;
  requiresPasscode?: boolean;
  shareableLink: string;
  link?: string;
  url?: string;
  viewCount?: number;
  viewed?: boolean;
  createdat: string;
  updatedat?: string;
}

export interface MessageFormData {
  message: string;
  image?: File | null;
  hasPasscode: boolean;
  passcode?: string;
}

export interface MessageWithReactions extends Message {
  length: number;
  map(arg0: (reaction: any) => import("react/jsx-runtime").JSX.Element): import("react").ReactNode;
  reactions: {
    id: string;
    createdat: string;
    thumbnailUrl?: string;
  }[];
}