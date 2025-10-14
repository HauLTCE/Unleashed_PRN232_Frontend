import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/authservice';

// Create the context
const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('authToken')); // Use function to read only once
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const logout = useCallback(() => {
        // Clear state and local storage
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    }, []);

    useEffect(() => {
        const verifyAuth = async () => {
            if (token) {
                try {
                    await authService.checkAuth();
                    const storedUser = localStorage.getItem('authUser');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                        setIsAuthenticated(true);
                    } else {
                        // If user data is missing, the state is inconsistent. Log out.
                        logout();
                    }
                } catch (err) {
                    console.error("Auth check failed, token is invalid or expired.", err);
                    logout(); // Clear out invalid token and user data
                }
            }
            setIsLoading(false);
        };

        verifyAuth();
    }, [token, logout]);

    const login = async (loginDto) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authService.login(loginDto);
            const { token: Token, user: Userid } = response.data;
            console.log(Token)
            localStorage.setItem('authToken', Token);
            localStorage.setItem('authUser', JSON.stringify(Userid));

            setUser(Userid);
            setToken(Token); // This will trigger the useEffect to re-verify
            setIsAuthenticated(true);
            return true;
        } catch (err) {
            const errorMessage = err.response?.data || err.message || "Login failed.";
            setError(errorMessage);
            console.error(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (createUserDto) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.register(createUserDto);
            return true;
        } catch (err) {
            const errorMessage = err.response?.data || err.message || "Registration failed.";
            setError(errorMessage);
            console.error(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to easily access the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

