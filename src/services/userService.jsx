import { apiClient } from "./ApiClient";

/**
 * Fetches all Userss.
 * Corresponds to: GET /api/Userss
 * @returns {Promise<Array>} A promise that resolves to an array of Users DTOs.
 */
export const getAllUsers = async () => {
    try {
        const response = await apiClient.get('/Users');
        return response.data;
    } catch (error) {
        console.error("Error fetching all Userss:", error);
        throw error;
    }
};

/**
 * Fetches a single Users by their ID.
 * Corresponds to: GET /api/Userss/{id}
 * @param {string} id The GUID of the Users.
 * @returns {Promise<Object>} A promise that resolves to the Users DTO.
 */
export const getUserById = async (id) => {
    try {
        const response = await apiClient.get(`/Users/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching Users with ID ${id}:`, error);
        throw error;
    }
};

/**
 * Fetches a single Users by their Usersname.
 * Corresponds to: GET /api/Userss/ByUsersname/{Usersname}
 * @param {string} Usersname The Usersname of the Users.
 * @returns {Promise<Object>} A promise that resolves to the Users DTO for import service.
 */
export const getUsersByUsername = async (Usersname) => {
    try {
        const response = await apiClient.get(`/Users/ByUsersname/${Usersname}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching Users with Usersname ${Usersname}:`, error);
        throw error;
    }
};

/**
 * Creates a new Users.
 * Corresponds to: POST /api/Userss
 * @param {object} createUsersDto The data for the new Users (e.g., { Usersname, email, password }).
 * @returns {Promise<Object>} A promise that resolves to the newly created Users DTO.
 */
export const createUser = async (createUsersDto) => {
    try {
        const response = await apiClient.post('/Users', createUsersDto);
        return response.data;
    } catch (error) {
        console.error("Error creating Users:", error);
        throw error;
    }
};

/**
 * Updates an existing Users.
 * Corresponds to: PUT /api/Userss/{id}
 * @param {string} id The GUID of the Users to update.
 * @param {object} updateUsersDto The updated Users data.
 * @returns {Promise<void>} A promise that resolves when the update is successful.
 */
export const updateUser = async (id, updateUsersDto) => {
    try {
        await apiClient.put(`/Users/${id}`, updateUsersDto);
    } catch (error) {
        console.error(`Error updating Users with ID ${id}:`, error);
        throw error;
    }
};

/**
 * Deletes a Users by their ID.
 * Corresponds to: DELETE /api/Userss/{id}
 * @param {string} id The GUID of the Users to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is successful.
 */
export const deleteUser = async (id) => {
    try {
        await apiClient.delete(`/Users/${id}`);
    } catch (error) {
        console.error(`Error deleting Users with ID ${id}:`, error);
        throw error;
    }
};