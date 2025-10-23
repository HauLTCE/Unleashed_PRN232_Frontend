import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../../services/authservice';

// Create the context
const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('authToken')); // Use function to read only once
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);


    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUserId(null);
        setIsAuthenticated(false);
    }, []);

    useEffect(() => {
        const verifyAuth = async () => {
            if (token) {
                try {
                    await authService.checkAuth();
                    const storedUserId = localStorage.getItem('authUser');
                    if (storedUserId) {
                        setUserId(JSON.parse(storedUserId));
                        setIsAuthenticated(true);
                    } else {
                        logout();
                    }
                } catch (err) {
                    console.error("Auth check failed, token is invalid or expired.", err);
                    logout(); // Clear invalid token
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, [token, logout]);

    const login = async (loginDto) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authService.login(loginDto);
            const { token: newToken, userId: newUserId } = response.data;
            localStorage.setItem('authToken', newToken);
            localStorage.setItem('authUser', JSON.stringify(newUserId));
            setToken(newToken);
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Login failed.";
            setError(errorMessage);
            console.error(errorMessage);
            setIsLoading(false); // Stop loading on failure
            return false;
        }
    };

    const register = async (createUserDto) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.register(createUserDto);
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Registration failed.";
            setError(errorMessage);
            console.error(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const sendResetPassword = async (email) => {
        try {

            const response = await authService.sendResetPassword(email);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to send reset link.";
            console.error("sendResetPassword error:", errorMessage);
            throw new Error(errorMessage); // Re-throw for the component to catch
        }
    };


    const checkResetPassword = async (userId, token) => {
        try {
            const response = await authService.checkResetPassword(userId, token);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Invalid or expired token.";
            console.error("checkResetPassword error:", errorMessage);
            throw new Error(errorMessage);
        }
    };


    const resetPassword = async (resetPasswordDto, token) => {
        try {
            const response = await authService.resetPassword(resetPasswordDto, token);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to reset password.";
            console.error("resetPassword error:", errorMessage);
            throw new Error(errorMessage);
        }
    };

    const confirmEmail = async (token) => {
        try {
            const response = await authService.confirmEmail(token);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to confirm email.";
            console.error("Confirm email error:", errorMessage);
            throw new Error(errorMessage);
        }
    }

    const value = {
        userId,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        sendResetPassword,
        checkResetPassword,
        resetPassword,
        confirmEmail
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};