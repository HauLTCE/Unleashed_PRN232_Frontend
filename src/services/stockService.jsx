// src/services/StockService.jsx
import { apiClient } from "./apiClient";

const BASE_API_URL = "/Stocks";

const stockService = {
    // GET: /api/stocks
    getAllStocks: async () => {
        try {
            const response = await apiClient.get(BASE_API_URL);
            return response.data;
        } catch (error) {
            console.error("Error fetching all stocks:", error);
            throw error;
        }
    },

    // GET: /api/stocks/{id}
    getStockById: async (id) => {
        try {
            const response = await apiClient.get(`${BASE_API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching stock with ID ${id}:`, error);
            throw error;
        }
    },

    // POST: /api/stocks
    createStock: async (stockDto) => {
        try {
            const response = await apiClient.post(BASE_API_URL, stockDto);
            return response.data;
        } catch (error) {
            console.error("Error creating stock:", error);
            throw error;
        }
    },

    // PUT: /api/stocks/{id}
    updateStock: async (id, updateStockDto) => {
        try {
            const response = await apiClient.put(`${BASE_API_URL}/${id}`, updateStockDto);
            return response.status === 204;
        } catch (error) {
            console.error(`Error updating stock with ID ${id}:`, error);
            throw error;
        }
    },

    // DELETE: /api/stocks/{id}
    deleteStock: async (id) => {
        try {
            const response = await apiClient.delete(`${BASE_API_URL}/${id}`);
            return response.status === 204;
        } catch (error) {
            console.error(`Error deleting stock with ID ${id}:`, error);
            throw error;
        }
    },

    // Optional: GET /api/stocks/by-variation-ids?ids=1,2,3
    getStocksByVariationIds: async (variationIds) => {
        try {
            const params = new URLSearchParams();
            variationIds.forEach((id) => params.append("ids", id));

            const response = await apiClient.get(`${BASE_API_URL}/by-variation-ids?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching stocks by variation IDs:", error);
            throw error;
        }
    },
};

export default stockService;
