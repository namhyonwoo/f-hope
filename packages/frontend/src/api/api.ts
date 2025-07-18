import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration or invalid token
    if (error.response && error.response.status === 401) {
      console.log('API: 401 Unauthorized, removing token');
      localStorage.removeItem('accessToken');
      // Don't redirect automatically, let the component handle it
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: any) => apiClient.post('/auth/register', data),
  login: (data: any) => apiClient.post('/auth/login', data),
  getProfile: () => apiClient.get('/auth/profile'),
  socialSignup: (data: any) => apiClient.post('/auth/social-signup', data),
};

export const profileApi = {
  getProfile: () => apiClient.get('/profile'),
  updateProfile: (data: any) => apiClient.put('/profile', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const studentApi = {
  createStudent: (data: any) => apiClient.post('/students', data),
  getAllStudents: () => apiClient.get('/students'),
  getStudentById: (id: string) => apiClient.get(`/students/${id}`),
  updateStudent: (id: string, data: any) => apiClient.put(`/students/${id}`, data),
  deleteStudent: (id: string) => apiClient.delete(`/students/${id}`),
  uploadStudentPhoto: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/students/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const attendanceApi = {
  createAttendanceRecord: (data: any) => apiClient.post('/attendance', data),
  upsertAttendanceRecords: (records: any[]) => apiClient.post('/attendance/upsert-batch', records),
  getAttendanceRecordsByDate: (date: string) => apiClient.get(`/attendance?date=${date}`),
  getAttendanceSummary: (date: string) => apiClient.get(`/attendance/summary?date=${date}`),
  getAttendanceRecordById: (id: string) => apiClient.get(`/attendance/${id}`),
  updateAttendanceRecord: (id: string, data: any) => apiClient.put(`/attendance/${id}`, data),
  deleteAttendanceRecord: (id: string) => apiClient.delete(`/attendance/${id}`),
};
