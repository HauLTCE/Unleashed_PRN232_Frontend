// src/services/providerService.jsx
import { apiClient } from './apiClient';

const BASE_URL = '/Providers';

const providerService = {
    /**
     * Fetch all providers
     */
    async getAllProviders() {
        try {
            const response = await apiClient.get(BASE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching providers:', error);
            throw error;
        }
    },

    /**
     * Fetch a single provider by ID
     * @param {number} id
     */
    async getProviderById(id) {
        try {
            const response = await apiClient.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching provider with id ${id}:`, error);
            throw error;
        }
    },

    /**
     * Create a new provider
     * @param {Object} providerData
     */
    async createProvider(providerData) {
        try {
            const response = await apiClient.post(BASE_URL, providerData);
            return response.data;
        } catch (error) {
            console.error('Error creating provider:', error);
            throw error;
        }
    },

    /**
     * Update an existing provider
     * @param {number} id
     * @param {Object} providerData
     */
    async updateProvider(id, providerData) {
        try {
            await apiClient.put(`${BASE_URL}/${id}`, providerData);
            return true;
        } catch (error) {
            console.error(`Error updating provider with id ${id}:`, error);
            throw error;
        }
    },

    /**
     * Delete a provider
     * @param {number} id
     */
    async deleteProvider(id) {
        try {
            await apiClient.delete(`${BASE_URL}/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting provider with id ${id}:`, error);
            throw error;
        }
    },
};

export default providerService;
