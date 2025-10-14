import axios from 'axios';

// Create a new Axios instance
// FIX: Added 'export' to make this a named export, allowing other files to import it.
export const apiClient = axios.create({
    // The base URL will be proxied to your backend server in development.
    // In production, this should be your actual API domain.
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Use an interceptor to add the JWT token to every request
apiClient.interceptors.request.use(
    (config) => {
        // Get the token from local storage
        const token = localStorage.getItem('authToken');

        // If the token exists, add it to the Authorization header
        if (token) {
            console.log(token)
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        // Handle request errors
        return Promise.reject(error);
    }
);
