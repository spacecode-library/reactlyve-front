import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL, REPLY_ROUTES } from '../components/constants/apiRoutes';

// Axios instance for authenticated requests
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }
    return Promise.reject(error);
  }
);

// ------------------ AUTH API ------------------
export const authApi = {
  getUser: () => api.get('/auth/user'),
  logout: () => api.post('/auth/logout'),
};

// ------------------ MESSAGES API ------------------
export const messagesApi = {
  createWithFormData: async (formData: FormData) => {
    return api.post('/messages/send', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getAll: () => api.get('/messages'),
  getById: (id: string) => api.get(`/messages/${id}`),
  delete: (id: string) => api.delete(`/messages/${id}`),
  getByShareableLink: (linkId: string) => {
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });

    const encodedLinkId = linkId.includes('http')
      ? encodeURIComponent(linkId)
      : linkId;

    return publicApi.get(`/messages/shared/${encodedLinkId}`);
  },
  verifyPasscode: (messageId: string, passcode: string) => {
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    return publicApi.post(`/messages/${messageId}/verify-passcode`, { passcode });
  },
};

// ------------------ REACTIONS API ------------------
export const reactionsApi = {
  init: (messageId: string, sessionId: string) => {
    return api.post(`/reactions/init/${messageId}`, { sessionId });
  },

  uploadVideoToReaction: (reactionId: string, video: Blob) => {
    const formData = new FormData();
    formData.append('video', video, 'reaction.webm');

    return api.put(`/reactions/${reactionId}/video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  upload: (messageId: string, video: Blob) => {
    const formData = new FormData();
    formData.append('video', video, 'reaction.webm');

    return api.post(`/reactions/${messageId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getByMessageId: (messageId: string) => api.get(`/reactions/message/${messageId}`),
  getById: (id: string) => api.get(`/reactions/${id}`),
  delete: (id: string) => api.delete(`/messages/${id}/delete`),
};

// ------------------ REPLIES API ------------------
export const repliesApi = {
  sendText: (reactionId: string, text: string) => {
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    return publicApi.post(REPLY_ROUTES.UPLOAD(reactionId), { text });
  },
};

// ------------------ ADMIN API ------------------
export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId: string, role: 'user' | 'admin') =>
    api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  getStats: () => api.get('/admin/stats'),
};

export default api;
