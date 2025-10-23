import { useState, useEffect } from 'react';
import userService from '../../services/userService';

export const useUser = (userId) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Don't fetch if no userId is provided
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await userService.getUserById(userId);
                setUser(data);
            } catch (err) {
                console.error("Failed to fetch user:", err);
                setError("Could not load customer data.");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]); // This effect re-runs whenever the userId prop changes

    // Function to update a user
    const editUser = async (id, updateUserDto) => {
        setLoading(true);
        try {
            await userService.updateUser(id, updateUserDto);
        } catch (err) {
            setError("Failed to update user.");
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const changeStatus = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            await authService.changeStatus(userId);
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "change status fail failed.";
            setError(errorMessage);
            console.error(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { user, loading, editUser, error, changeStatus };
};