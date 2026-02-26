import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cv_token');
      localStorage.removeItem('cv_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
