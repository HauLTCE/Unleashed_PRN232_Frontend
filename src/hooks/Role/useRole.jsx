import { useState, useEffect, useCallback } from 'react';
import * as roleService from '../../services/roleService'

export const useRoles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all roles and update the state
    const fetchRoles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await roleService.getAllRoles();
            setRoles(Array.isArray(data) ? data : []);
        } catch (err) {
            setError("Failed to fetch roles. Please try again later.");
            console.error(err);
            setRoles([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load roles on initial mount
    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    // Function to add a role
    const addRole = async (createRoleDto) => {
        try {
            const newRole = await roleService.createRole(createRoleDto);
            // Add the new role to the local state to update the UI instantly
            setRoles((prevRoles) => [...prevRoles, newRole]);
            return newRole;
        } catch (err) {
            setError("Failed to create role.");
            console.error(err);
            throw err; // Re-throw so the component knows the operation failed
        }
    };

    // Function to remove a role
    const removeRole = async (id) => {
        try {
            await roleService.deleteRole(id);
            // Remove the role from the local state
            setRoles((prevRoles) => prevRoles.filter((role) => role.roleId !== id));
        } catch (err) {
            setError("Failed to delete role.");
            console.error(err);
            throw err;
        }
    };

    // Function to update a role
    const editRole = async (id, updateRoleDto) => {
        try {
            await roleService.updateRole(id, updateRoleDto);
            // Update the role in the local state
            setRoles((prevRoles) =>
                prevRoles.map((role) =>
                    role.roleId === id ? { ...role, ...updateRoleDto } : role
                )
            );
        } catch (err) {
            setError("Failed to update role.");
            console.error(err);
            throw err;
        }
    };

    return {
        roles,
        loading,
        error,
        fetchRoles, // Expose for manual refreshing
        addRole,
        removeRole,
        editRole,
    };
};