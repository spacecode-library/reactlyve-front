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
    let errorMessage = 'Something went wrong';
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error; // Use the 'error' field if present
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message; // Fallback to 'message' field
    }

    if (error.response?.status !== 401) { // Keep existing 401 behavior
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
  delete: (id: string) => api.delete(`/messages/${id}/delete`),
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
  init: (messageId: string, sessionId: string, name?: string) => {
    return api.post(`/reactions/init/${messageId}`, { sessionId, name });
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
  deleteReactionById: (reactionId: string) => api.delete(`/reactions/${reactionId}/delete`),
  deleteAllForMessage: (messageId: string) => api.delete(`/messages/${messageId}/reactions/delete`),
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

// ------------------ PROFILE API ------------------
export const profileApi = {
  getProfileMe: () => api.get('/api/profile/me'),
  deleteProfileMe: () => api.delete('/api/profile/me'),
};

// ------------------ NEW ADMIN API FUNCTIONS ------------------
// Note: These functions are added here because they are admin-related.
// Depending on the project structure, they could be in a separate adminApi service.
export const newAdminApi = {
  getAdminUsers: () => api.get('/api/admin/users'),
  updateAdminUserRole: (userId: string, role: User['role']) =>
    api.put(`/api/admin/users/${userId}/role`, { role }),
  deleteAdminUser: (userId: string) => api.delete(`/api/admin/users/${userId}`),
};

export default api;
