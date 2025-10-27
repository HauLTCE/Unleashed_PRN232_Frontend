import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../../services/notificationService';

export const useNotification = (notificationId) => {
    const [notification, setNotification] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refetchIndex, setRefetchIndex] = useState(0);

    useEffect(() => {
        if (!notificationId) {
            setLoading(false);
            return;
        }

        const fetchNotifications = async () => {
            setLoading(true);
            setError(null);
            try {
                // Assumes a method getNotificationsBynotificationId exists
                const data = await notificationService.getNotificationById(notificationId)
                setNotification(data || []); // Ensure data is at least an empty array
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
                setError("Could not load notifications.");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [notificationId, refetchIndex]);

    /**
         * Updates an existing notification.
         * Note: This hook does not automatically refetch. The component should call fetchNotifications.
         * @param {number} id - The ID of the notification to update.
         * @param {object} updateDto - The DTO with updates.
         */
    const updateNotification = useCallback(async (id, updateDto) => {
        try {
            await notificationService.updateNotification(id, updateDto);
            setRefetchIndex(prevIndex => prevIndex + 1);
        } catch (err) {
            console.error("Failed to update notification:", err);
            setError(err);
            throw err;
        }
    }, []);

    return { notification, loading, error, updateNotification };
};
