import { apiClient } from "./ApiClient";

const ENDPOINT = "/NotificationUsers";

export const notificationUserService = {
    // ✅ GET all (not paginated)
    getAll: async () => {
        const res = await apiClient.get(ENDPOINT);
        return res.data;
    },

    // ✅ GET paginated notifications for a user
    getByUserIdPaged: async (userId, pageNumber = 1, pageSize = 10, searchQuery = "") => {
        const res = await apiClient.get(`${ENDPOINT}/${userId}`, {
            params: { pageNumber, pageSize, searchQuery }
        });
        return res.data;
    },

    // ✅ GET single record by notification + user ID
    getById: async (notificationId, userId) => {
        const res = await apiClient.get(`${ENDPOINT}/${notificationId}/${userId}`);
        return res.data;
    },

    // ✅ Create NotificationUser records
    create: async (notificationId) => {
        const res = await apiClient.post(ENDPOINT, null, {
            params: { notificationId }
        });
        return res.data;
    },

    // ✅ Update notification user (e.g. mark viewed)
    update: async (notificationId, userId, updateDto) => {
        const res = await apiClient.put(`${ENDPOINT}/${notificationId}/${userId}`, updateDto);
        return res.data;
    },

    // ✅ Delete notification user
    delete: async (notificationId, userId) => {
        const res = await apiClient.delete(`${ENDPOINT}/${notificationId}/${userId}`);
        return res.data;
    }
};
