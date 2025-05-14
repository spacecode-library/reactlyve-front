import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL, REPLY_ROUTES } from '../components/constants/apiRoutes';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  getUser: () => api.get('/auth/user'),
  logout: () => api.post('/auth/logout'),
};

// Messages API
export const messagesApi = {
  // create:async (data: {
  //   message: string;
  //   image?: File | null;
  //   hasPasscode: boolean;
  //   passcode?: string;
  // }) => {
  //   const formData = new FormData();
  //   // Use 'content' as the field name to match backend expectation
  //   formData.append('content', data.message);
  //   if (data.image) {
  //     formData.append('image', data.image);
  //   }
  //   formData.append('hasPasscode', String(data.hasPasscode));
  //   if (data.hasPasscode && data.passcode) {
  //     formData.append('passcode', data.passcode);
  //   }
    
  //   const response = await api.post('/messages/send', formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data',
  //     },
  //   });
  //   console.log("response from service",response)
  //   return response;
  // },
  // These routes might also need to be fixed
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
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    
    const encodedLinkId = linkId.includes('http') ? 
      encodeURIComponent(linkId) : linkId;
      
    return publicApi.get(`/messages/shared/${encodedLinkId}`);
  },
  verifyPasscode: (linkId: string, passcode: string) => {
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return publicApi.get(`/messages/shared/${linkId}?passcode=${passcode}`);
  },
};

// Reactions API
export const reactionsApi = {
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

// Replies API
export const repliesApi = {
  sendText: (messageId: string, text: string) => {
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return publicApi.post(REPLY_ROUTES.UPLOAD(messageId), { text });
  },
};

// Admin API
export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId: string, role: 'user' | 'admin') => 
    api.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  getStats: () => api.get('/admin/stats'),
};

export default api;
