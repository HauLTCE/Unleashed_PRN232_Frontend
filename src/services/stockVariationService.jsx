import { apiClient } from './apiClient';

const BASE_API_URL = '/StockVariations';

export const stockVariationService = {

    getAll: async () => {
        const response = await apiClient.get(BASE_API_URL);
        return response.data;
    },

    getById: async (stockId, variationId) => {
        const response = await apiClient.get(`${BASE_API_URL}/${stockId}/${variationId}`);
        return response.data;
    },

    getStockByVariationId: async (variationId) => {
        const response = await apiClient.get(`${BASE_API_URL}/get-stock-by-variation/${variationId}`);
        return response.data;
    },

    getStockByIds: async (variationIds) => {
        const response = await apiClient.post(`${BASE_API_URL}/get-stock-by-ids`, variationIds);
        return response.data;
    },

    create: async (stockVariation) => {
        const response = await apiClient.post(BASE_API_URL, stockVariation);
        return response.data;
    },

    update: async (stockId, variationId, stockVariation) => {
        const response = await apiClient.put(`${BASE_API_URL}/${stockId}/${variationId}`, stockVariation);
        return response.data;
    },

    delete: async (stockId, variationId) => {
        const response = await apiClient.delete(`${BASE_API_URL}/${stockId}/${variationId}`);
        return response.data;
    },
    async getByStockId(stockId) {
        const response = await apiClient.get(`${BASE_API_URL}/by-stock/${stockId}`);
        return response.data;
    },
};
