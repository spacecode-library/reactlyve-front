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
  }