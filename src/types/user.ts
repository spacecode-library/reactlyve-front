export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
    role: 'user' | 'admin' | 'guest';
    last_login: string;
    blocked: boolean;
    createdAt?: string;
    updatedAt?: string;
  }