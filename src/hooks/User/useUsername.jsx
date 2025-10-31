import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // You may need to install this: npm install jwt-decode

export const useUsername = () => {
    const [username, setUsername] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                // The username is stored in the 'unique_name' claim as seen in your JWT
                setUsername(decodedToken.unique_name); 
            } catch (error) {
                console.error("Failed to decode JWT:", error);
                setUsername(null);
            }
        }
    }, []);

    return username;
};