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

// Handle 401 responses globally — only clear token if the server explicitly
// says the token is invalid (our backend 401s), not for other 401 sources.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const msg = error.response?.data?.message || '';
        // Only treat as "session expired" when OUR backend returns 401 with
        // one of its known auth-failure messages. This prevents a Cloudinary
        // or third-party 401 from accidentally wiping the user's session.
        const isAuthFailure =
            status === 401 &&
            (msg.includes('No token') ||
                msg.includes('Token is not valid') ||
                msg.includes('User not found') ||
                msg.includes('Not authenticated'));
        if (isAuthFailure) {
            localStorage.removeItem('barakahx_token');
            localStorage.removeItem('barakahx_user');
            if (!window.location.pathname.includes('/login')) {
                window.location.replace('/login');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
