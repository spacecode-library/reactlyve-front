import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // You can modify request config here if needed
    // For example, add authorization header etc.
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
    // Handle errors globally
    const errorMessage = error.response?.data?.message || 'Something went wrong';
    
    // Don't show toast for 401 errors, they will be handled by auth context
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
// Messages API
export const messagesApi = {
  create: (data: {message: string;image?: File | null;hasPasscode: boolean;passcode?: string;}) => {
    const formData = new FormData();
    // Change this line - rename message to content
    formData.append('content', data.message); // Changed from 'message' to 'content'
    if (data.image) {
      formData.append('image', data.image);
    }
    formData.append('hasPasscode', String(data.hasPasscode));
    if (data.hasPasscode && data.passcode) {
      formData.append('passcode', data.passcode);
    }
    // Log all form data entries
    console.log('Form data contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    return api.post('/messages/send', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  // These routes might also need to be fixed
  getAll: () => api.get('/messages'),
  getById: (id: string) => api.get(`/messages/${id}`),
  delete: (id: string) => api.delete(`/messages/${id}`),
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
  delete: (id: string) => api.delete(`/reactions/${id}`),
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