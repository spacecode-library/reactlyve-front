// Base API URL
export const API_BASE_URL = 'http://localhost:8000/api';

// Auth Routes
export const AUTH_ROUTES = {
  GOOGLE: `${API_BASE_URL}/auth/google`,
  USER: `${API_BASE_URL}/auth/user`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
};

// Message Routes
export const MESSAGE_ROUTES = {
  CREATE: `${API_BASE_URL}/messages/create`,
  GET_ALL: `${API_BASE_URL}/messages`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/messages/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/messages/${id}`,
  VIEW: (id: string) => `${API_BASE_URL}/messages/view/${id}`,
  VERIFY_PASSCODE: (id: string) => `${API_BASE_URL}/messages/${id}/verify-passcode`,
};

// Reaction Routes
export const REACTION_ROUTES = {
  UPLOAD: (messageId: string) => `${API_BASE_URL}/reactions/${messageId}`,
  GET_BY_MESSAGE_ID: (messageId: string) => `${API_BASE_URL}/reactions/message/${messageId}`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/reactions/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/reactions/${id}`,
  DOWNLOAD: (id: string) => `${API_BASE_URL}/reactions/${id}/download`,
};

// Admin Routes
export const ADMIN_ROUTES = {
  USERS: `${API_BASE_URL}/admin/users`,
  UPDATE_USER_ROLE: (userId: string) => `${API_BASE_URL}/admin/users/${userId}/role`,
  DELETE_USER: (userId: string) => `${API_BASE_URL}/admin/users/${userId}`,
  STATS: `${API_BASE_URL}/admin/stats`,
};