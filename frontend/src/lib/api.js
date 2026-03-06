import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Attach JWT token to every request if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('barakahx_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses globally — clear token and redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('barakahx_token');
            localStorage.removeItem('barakahx_user');
            // Only redirect if not already on login page to avoid infinite loops
            if (!window.location.pathname.includes('/login')) {
                window.location.replace('/login');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
