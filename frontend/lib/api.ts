import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7777',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        // Only run in browser
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== 'undefined') {
            // Handle 401 Unauthorized
            if (error.response?.status === 401) {
                // Clear auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Redirect to login (unless already on auth pages)
                const currentPath = window.location.pathname;
                if (!currentPath.startsWith('/auth')) {
                    window.location.href = '/auth/signin';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
