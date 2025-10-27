import { apiClient } from "./ApiClient";

const API_BASE_URL = '/api/NotificationUsers';

const notificationUserService = {
    /**
     * GET: /api/NotificationUsers
     * Fetches all notification-user records.
     */
    getAll: async () => {
        try {
            // apiClient.get typically returns { data: [...] }
            const response = await apiClient.get(API_BASE_URL);
            return response.data; // Return the data array directly
        } catch (error) {
            console.error('Failed to fetch notification users:', error);
            throw new Error('Failed to fetch notification users');
        }
    },

    getByUserId: async (userId, pageNumber, pageSize, searchQuery) => {
        // Create query parameters
        const params = new URLSearchParams({
            pageNumber: pageNumber,
            pageSize: pageSize,
        });

        // Only add searchQuery if it exists
        if (searchQuery) {
            params.append('searchQuery', searchQuery);
        }

        try {
            const url = `${API_BASE_URL}/${userId}?${params.toString()}`;
            const response = await apiClient.get(url);
            return response.data; // Return the paged object { items: [], totalCount: ... }
        } catch (error) {
            console.error('Failed to fetch user notifications:', error);
            throw new Error('Failed to fetch user notifications');
        }
    },

    /**
     * POST: /api/NotificationUsers
     * Creates a new notification-user record.
     */
    create: async (createDto) => {
        try {
            // apiClient.post typically returns { data: {...} }
            const response = await apiClient.post(API_BASE_URL, createDto);
            return response.data; // Return the new record
        } catch (error) {
            console.error('Failed to create notification user:', error);
            throw new Error('Failed to create notification user');
        }
    },

    /**
     * PUT: /api/NotificationUsers/{notificationId}/{userId}
     * Updates an existing notification-user record.
     */
    update: async (notificationId, userId, updateDto) => {
        try {
            // Use apiClient.put and construct the URL
            // PUT requests often return 204 No Content, so we don't expect data back
            await apiClient.put(`${API_BASE_URL}/${notificationId}/${userId}`, updateDto);
            return true; // Success
        } catch (error) {
            console.error('Failed to update notification user:', error);
            throw new Error('Failed to update notification user');
        }
    },

    /**
     * DELETE: /api/NotificationUsers/{notificationId}
     * Deletes a notification-user record.
     */
    delete: async (notificationId) => {
        try {
            // Use apiClient.delete and construct the URL
            // DELETE requests often return 204 No Content
            await apiClient.delete(`${API_BASE_URL}/${notificationId}`);
            return true;
        } catch (error) {
            console.error('Failed to delete notification user:', error);
            throw new Error('Failed to delete notification user');
        }
    },

    /**
     * DELETE: /api/NotificationUsers/{notificationId}/{userId}
     * Deletes a notification-user record.
     */
    delete: async (notificationId, userId) => {
        try {
            // Use apiClient.delete and construct the URL
            // DELETE requests often return 204 No Content
            await apiClient.delete(`${API_BASE_URL}/${notificationId}/${userId}`);
            return true;
        } catch (error) {
            console.error('Failed to delete notification user:', error);
            throw new Error('Failed to delete notification user');
        }
    },
};

export default notificationUserService;