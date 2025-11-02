import { useState, useCallback } from 'react';
import { notificationService } from '../../services/notificationService'; // Assuming service is at this path

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalCount: 0,
        hasPrevious: false,
        hasNext: false,
    });
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetches notifications from the server with pagination and filters.
     */
    const fetchNotifications = useCallback(async (page = 1, size = 10, filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await notificationService.getAllNotifications(page, size, filters);

            // Corrected: Set notifications from data.items
            setNotifications(data.items || []);
            setPagination({
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                pageSize: data.pageSize,
                totalCount: data.totalCount,
                hasPrevious: data.hasPrevious,
                hasNext: data.hasNext,
            });
            // Corrected: Set total from data.totalCount
            setTotal(data?.totalCount);

        } catch (err) {
            console.error("Failed to fetch notifications:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Creates a new notification.
     * Note: This hook does not automatically refetch. The component should call fetchNotifications.
     * @param {object} createDto - The DTO required to create a notification.
     */
    const createNotification = useCallback(async (createDto) => {
        try {
            return await notificationService.createNotification(createDto);
        } catch (err) {
            console.error("Failed to create notification:", err);
            setError(err); // Or handle create-specific errors
            throw err; // Re-throw
        }
    }, []);



    /**
     * Deletes a notification.
     * Note: This hook does not automatically refetch. The component should call fetchNotifications.
     * @param {number} id - The ID of the notification to delete.
     */
    const removeNotification = useCallback(async (id) => {
        try {
            await notificationService.deleteNotification(id);
        } catch (err) {
            console.error("Failed to delete notification:", err);
            setError(err);
            throw err; // Re-throw
        }
    }, []);

    return {
        notifications,
        pagination,
        total,
        loading,
        error,
        fetchNotifications,
        createNotification,
        removeNotification
    };
};
