export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
    role: 'user' | 'admin';
    createdAt?: string;
    updatedAt?: string;
  }