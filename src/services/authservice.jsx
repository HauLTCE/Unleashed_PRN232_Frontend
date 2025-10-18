import { apiClient } from "./ApiClient";


export const authService = {
    /**
     * Sends a registration request to the API.
     * Corresponds to: POST /api/Authen/register
     * @param {object} createUserDto - The user registration data (e.g., { username, email, password }).
     * @returns {Promise<object>} The newly created user's data.
     */
    register: (createUserDto) => {
        return apiClient.post('/Authen/register', createUserDto);
    },

    /**
     * Sends a login request to the API.
     * Corresponds to: POST /api/Authen/login
     * @param {object} loginDto - The user's credentials (e.g., { username, password }).
     * @returns {Promise<object>} The login response, including the JWT and user info.
     */
    login: (loginDto) => {
        return apiClient.post('/Authen/login', loginDto);
    },

    /**
     * Checks if the current JWT is valid by calling a protected endpoint.
     * Corresponds to: GET /api/Authen/check-auth
     * @returns {Promise<object>} The response from the server if authorized.
     */
    checkAuth: () => {
        return apiClient.get('/Authen/check-auth');
    },
};

// The 'export default' line is no longer needed.
