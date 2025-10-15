import { apiClient } from "./ApiClient";

/**
 * Fetches all roles.
 * Corresponds to: GET /api/Roles
 * @returns {Promise<Array>} A promise that resolves to an array of role DTOs.
 */
export const getAllRoles = async () => {
    try {
        const response = await apiClient.get('/Roles');
        return response.data;
    } catch (error) {
        console.error("Error fetching all roles:", error);
        throw error;
    }
};

/**
 * Fetches a single role by its ID.
 * Corresponds to: GET /api/Roles/{id}
 * @param {number} id The ID of the role.
 * @returns {Promise<Object>} A promise that resolves to the role DTO.
 */
export const getRoleById = async (id) => {
    try {
        const response = await apiClient.get(`/Roles/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching role with ID ${id}:`, error);
        throw error;
    }
};

/**
 * Creates a new role.
 * Corresponds to: POST /api/Roles
 * @param {object} createRoleDto The data for the new role (e.g., { roleName }).
 * @returns {Promise<Object>} A promise that resolves to the newly created role DTO.
 */
export const createRole = async (createRoleDto) => {
    try {
        const response = await apiClient.post('/Roles', createRoleDto);
        return response.data;
    } catch (error) {
        console.error("Error creating role:", error);
        throw error;
    }
};

/**
 * Updates an existing role.
 * Corresponds to: PUT /api/Roles/{id}
 * @param {number} id The ID of the role to update.
 * @param {object} updateRoleDto The updated role data.
 * @returns {Promise<void>} A promise that resolves when the update is successful.
 */
export const updateRole = async (id, updateRoleDto) => {
    try {
        await apiClient.put(`/Roles/${id}`, updateRoleDto);
    } catch (error) {
        console.error(`Error updating role with ID ${id}:`, error);
        throw error;
    }
};

/**
 * Deletes a role by its ID.
 * Corresponds to: DELETE /api/Roles/{id}
 * @param {number} id The ID of the role to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is successful.
 */
export const deleteRole = async (id) => {
    try {
        await apiClient.delete(`/${id}`);
    } catch (error) {
        console.error(`Error deleting role with ID ${id}:`, error);
        throw error;
    }
};