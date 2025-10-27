import { useCallback, useEffect } from 'react';
import notificationUserService from '../../services/notificationUserService'

export const useNotificationUsers = () => {
    const [notificationUsers, setNotificationUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetches all notification users and updates state.
     */
    const fetchNotificationUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await notificationUserService.getAll();
            setNotificationUsers(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);



    /**
     * Adds a new notification user.
     * @param {object} createDto - The DTO for creating a new record.
     */
    const addNotificationUser = useCallback(async (createDto) => {
        setError(null);
        try {
            const newRecord = await notificationUserService.create(createDto);
            setNotificationUsers(prev => [...prev, newRecord]);
            return newRecord;
        } catch (err) {
            setError(err);
            throw err;
        }
    }, []);

    /**
     * Removes a notification user.
     * @param {number} notificationId
     * @param {string} userId - (Guid)
     */
    const removeNotificationUser = useCallback(async (notificationId, userId) => {
        setError(null);
        try {
            await notificationUserService.delete(notificationId, userId);
            // Remove the record from the local state
            setNotificationUsers(prev =>
                prev.filter(nu =>
                    !(nu.notificationId === notificationId && nu.userId === userId)
                )
            );
        } catch (err) {
            setError(err);
            throw err; // Re-throw
        }
    }, []);

    return {
        notificationUsers,
        loading,
        error,
        addNotificationUser,
        fetchNotificationUsers,
        updateNotificationUser,
        removeNotificationUser,
    };
};