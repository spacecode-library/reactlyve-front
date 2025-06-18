import axios from 'axios';
import toast from 'react-hot-toast';
import { GENERAL_ERRORS } from '../components/constants/errorMessages';
import type { User } from '../types/user';
import { API_BASE_URL, REPLY_ROUTES } from '../components/constants/apiRoutes';

// Axios instance for authenticated requests
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Requests will include credentials (cookies) automatically via withCredentials

// Global response error handler
api.interceptors.response.use(
  response => response,
  error => {
    let errorMessage = GENERAL_ERRORS.SOMETHING_WENT_WRONG;

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = GENERAL_ERRORS.TIMEOUT;
    } else if (!error.response) {
      errorMessage = GENERAL_ERRORS.NETWORK_ERROR;
    } else {
      const status = error.response.status;
      if (status >= 500) {
        errorMessage = GENERAL_ERRORS.SERVER_ERROR;
      } else if (status === 404) {
        errorMessage = GENERAL_ERRORS.NOT_FOUND;
      } else if (status === 403) {
        errorMessage = GENERAL_ERRORS.FORBIDDEN;
      }
    }

    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }
    return Promise.reject(error);
  }
);


// ------------------ AUTH API ------------------
// Note: Backend's /auth/user now returns user object with camelCase keys
// (e.g., response.data.user.googleId, response.data.user.createdAt)
export const authApi = {
  getUser: () => api.get('/auth/user'),
  logout: () => api.post('/auth/logout'),
};

// ------------------ MESSAGES API ------------------
// Note: Backend responses for getAll, getById now return objects with camelCase keys
// (e.g., message.createdAt, message.imageUrl, message.reactions: [{ videoUrl, createdAt }])
export const messagesApi = {
  createWithFormData: async (formData: FormData) => {
    // FormData keys (content, passcode) should be lowercase to match backend expectation
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
      timeout: 5000, // It's good practice to have a timeout for public APIs
    });

    const encodedLinkId = linkId.includes('http') ? encodeURIComponent(linkId) : linkId;
    // Backend for this route also returns camelCased message objects if passcode not required
    return publicApi.get(`/messages/shared/${encodedLinkId}`);
  },
  verifyPasscode: (messageId: string, passcode: string) => {
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });
    // Backend expects { passcode: "value" } (lowercase)
    // Backend returns camelCased message object upon success
    return publicApi.post(`/messages/${messageId}/verify-passcode`, { passcode });
  },
  updateMessageDetails: async (
    messageId: string,
    data: { reaction_length?: number; passcode?: string | null }
  ) => {
    return api.put(`/messages/${messageId}`, data);
  },
  submitForManualReview: (messageId: string) => api.post(`/messages/${messageId}/manual-review`),
};

export const messageLinksApi = {
  create: (messageId: string, onetime?: boolean) =>
    api.post(`/messages/${messageId}/links`, { onetime }),
  list: (messageId: string) => api.get(`/messages/${messageId}/links`),
  delete: (linkId: string) => api.delete(`/messages/links/${linkId}`),
};

// ------------------ REACTIONS API ------------------
export const reactionsApi = {
  init: (
    messageId: string,
    sessionId: string,
    name?: string,
    linkId?: string
  ) => {
    // Backend expects sessionid in body and optional linkId
    return api.post(`/reactions/init/${messageId}`, {
      sessionid: sessionId,
      name,
      linkId,
    });
  },

  uploadVideoToReaction: (reactionId: string, video: Blob) => {
    const formData = new FormData();
    formData.append('video', video, 'reaction.webm');
    // Backend returns { success, message, videoUrl } (camelCase)
    return api.put(`/reactions/${reactionId}/video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  upload: (messageId: string, video: Blob) => {
    const formData = new FormData();
    // Backend's messageController#recordReaction expects 'name' in req.body if sent with FormData.
    // If 'name' is part of this call, ensure formData.append('name', nameValue);
    formData.append('video', video, 'reaction.webm');
    // Backend returns { success, message, reactionId } (camelCase)
    return api.post(`/reactions/${messageId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  // Backend for getByMessageId now returns objects with camelCase keys
  // (e.g., reaction.videoUrl, reaction.createdAt)
  getByMessageId: (messageId: string) => api.get(`/reactions/message/${messageId}`),
  // Backend for getById now returns object with camelCase keys
  getById: (id: string) => api.get(`/reactions/${id}`),
  deleteReactionById: (reactionId: string) => api.delete(`/reactions/${reactionId}/delete`),
  deleteAllForMessage: (messageId: string) => api.delete(`/messages/${messageId}/reactions/delete`),
  submitForManualReview: (reactionId: string) => api.post(`/reactions/${reactionId}/manual-review`),
};

// ------------------ REPLIES API ------------------
export const repliesApi = {
  sendText: (reactionId: string, text: string) => {
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });
    // Backend expects { text: "value" } (lowercase)
    return publicApi.post(REPLY_ROUTES.UPLOAD(reactionId), { text });
  },
};

// ------------------ ADMIN API ------------------

// Interface for the payload sent to updateUserLimits, using snake_case
interface UpdateUserLimitsPayload {
  max_messages_per_month?: number | null;
  max_reactions_per_month?: number | null;
  max_reactions_per_message?: number | null;
  last_usage_reset_date?: string | null; // Should be an ISO date string
}

interface UpdateUserModerationPayload {
  moderate_images?: boolean;
  moderate_videos?: boolean;
}

// Note: Backend responses for getUsers and updateUserRole now return user objects with camelCase keys
// (e.g., user.googleId, user.createdAt)
export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId: string, role: User['role'], lastUsageResetDate?: string) => {
    // Backend expects { role: "value" } (lowercase)
    // And optionally { last_usage_reset_date: "value" } (snake_case)
    const payload: { role: User['role']; last_usage_reset_date?: string } = { role };
    if (lastUsageResetDate) {
      payload.last_usage_reset_date = lastUsageResetDate;
    }
    return api.put(`/admin/users/${userId}/role`, payload);
  },
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  getStats: () => api.get('/admin/stats'), // Assuming this endpoint returns data; check its casing if complex.
  getUserDetails: async (userId: string) => {
    const res = await api.get(`/admin/users/${userId}/details`);
    return res;
  },
  updateUserLimits: async (userId: string, limits: UpdateUserLimitsPayload) => {
    const response = await api.put(`/admin/users/${userId}/limits`, limits);
    return response;
  },
  // The backend does not expose a dedicated /moderation endpoint.
  // Moderation flags are updated via the same limits route.
  updateUserModeration: async (userId: string, moderation: UpdateUserModerationPayload) => {
    const response = await api.put(`/admin/users/${userId}/limits`, moderation);
    return response;
  },
  getModerationSummary: async () => {
    const res = await api.get('/admin/moderation/pending-counts');
    return res;
  },
  getUserPendingModeration: async (userId: string) => {
    const res = await api.get(`/admin/users/${userId}/pending-moderation`);
    return res;
  },
};

// ------------------ PROFILE API ------------------
// Note: Backend response for getProfileMe now returns user object with camelCase keys
// (e.g., user.googleId, user.createdAt)
export const profileApi = {
  getProfileMe: () => api.get('/profile/me'),
  deleteProfileMe: () => api.delete('/profile/me'),
};

export default api;
