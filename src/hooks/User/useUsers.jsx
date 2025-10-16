import { useState, useEffect, useCallback } from 'react';
import * as userService from '../../services/userService';

export const useUsers = () => {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalCount: 0,
        hasPrevious: false,
        hasNext: false,
    });

    const fetchUsers = useCallback(async (page = 1, size = 10, searchTerm = '') => {
        setLoading(true);
        setError(null);
        try {
            // Pass the searchTerm to the updated service method
            const data = await userService.getAllUsers(page, size, searchTerm);

            setUsers(data.items || []);
            setPagination({
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                pageSize: data.pageSize,
                totalCount: data.totalCount,
                hasPrevious: data.hasPrevious,
                hasNext: data.hasNext,
            });
        } catch (err) {
            setError("Failed to fetch users. Please try again later.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);


    // Function to add a user
    const addUser = async (createUserDto) => {
        setLoading(true);
        try {
            const newUser = await userService.createUser(createUserDto);
            // Add new user to the local state to avoid a full refetch
            setUsers((prevUsers) => [...prevUsers, newUser]);
            return newUser; // Return for potential further action in the component
        } catch (err) {
            setError("Failed to create user.");
            console.error(err);
            throw err; // Re-throw to let the component know it failed
        } finally {
            setLoading(false);
        }
    };

    // Function to remove a user
    const removeUser = async (id) => {
        setLoading(true);
        try {
            await userService.deleteUser(id);
            // Remove user from the local state
            setUsers((prevUsers) => prevUsers.filter((user) => user.userId !== id));
        } catch (err) {
            setError("Failed to delete user.");
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Return state and functions for components to use
    return {
        users,
        loading,
        pagination,
        error,
        fetchUsers, // You can expose this to allow manual refetching
        addUser,
        removeUser,
    };
};