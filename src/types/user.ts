export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
    role: 'user' | 'admin' | 'guest';
    lastLogin: string; // Changed from last_login
    blocked: boolean;
    createdAt?: string;
    updatedAt?: string;
    max_messages_per_month: number | null;
    current_messages_this_month: number;
    max_reactions_per_month: number | null;
    current_reactions_this_month: number;
    last_usage_reset_date: string | null;
    max_reactions_per_message: number | null;
  }