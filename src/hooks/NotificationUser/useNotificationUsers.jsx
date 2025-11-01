import { useEffect, useState, useCallback } from "react";
import { notificationUserService } from "../../services/notificationUserService";

export const useNotificationUsers = (userId, initialPage = 1, initialPageSize = 10) => {
    const [notifications, setNotifications] = useState([]);
    const [unviewCount, setUnviewCount] = useState(0);
    const [pageNumber, setPageNumber] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [searchQuery, setSearchQuery] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);

        try {
            const res = await notificationUserService.getByUserIdPaged(
                userId,
                pageNumber,
                pageSize,
                searchQuery
            );

            setNotifications(res.items || []);
            setUnviewCount(res.unviewCount || 0);
            setTotalPages(res.totalPages || 1);
            setTotalCount(res.totalCount || 0);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    }, [userId, pageNumber, pageSize, searchQuery]);

    const createNotificationUsers = async (notificationId) => {
        setLoading(true);
        setError(null);

        try {
            return await notificationUserService.create(notificationId);
        } catch (err) {
            console.error(err);
            setError("Failed to create NotificationUser records");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const markAsViewed = async (notificationId) => {
        setLoading(true);
        setError(null);

        try {
            const data = await notificationUserService.update(notificationId, userId = JSON.parse(localStorage.getItem("authUser")), { IsNotificationViewed: true, IsNotificationDeleted: false });
            return data;
        } catch (err) {
            console.error(err);
            setError("Failed to create NotificationUser records");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const markAsDelete = async (notificationId) => {
        setLoading(true);
        setError(null);

        try {
            const data = await notificationUserService.update(notificationId, userId = JSON.parse(localStorage.getItem("authUser")), { IsNotificationViewed: true, IsNotificationDeleted: true });
            setNotifications((prev) => prev.filter(n => n.notificationId !== notificationId));
            return data;
        } catch (err) {
            console.error(err);
            setError("Failed to create NotificationUser records");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        unviewCount,
        loading,
        error,
        pageNumber,
        pageSize,
        totalPages,
        totalCount,
        searchQuery,
        setSearchQuery,
        setPageNumber,
        setPageSize,
        refetch: fetchNotifications,
        createNotificationUsers,
        markAsViewed,
        markAsDelete,
        setNotifications,
        setUnviewCount
    };
};
