import { apiClient } from "./apiClient";

const BASE_API_URL = "/Stocks";

const stockService = {
    // GET: /api/Stocks
    getAllStocks: async () => {
        try {
            const response = await apiClient.get(BASE_API_URL);
            return response.data;
        } catch (error) {
            console.error("Error fetching all stocks:", error);
            throw error;
        }
    },

    // GET: /api/Stocks/{id}
    getStockById: async (id) => {
        try {
            const response = await apiClient.get(`${BASE_API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching stock with ID ${id}:`, error);
            throw error;
        }
    },

    // POST: /api/Stocks
    createStock: async (stockDto) => {
        try {
            const response = await apiClient.post(BASE_API_URL, stockDto);
            return response.data;
        } catch (error) {
            console.error("Error creating stock:", error);
            throw error;
        }
    },

    // PUT: /api/Stocks/{id}
    updateStock: async (id, updateStockDto) => {
        try {
            const response = await apiClient.put(`${BASE_API_URL}/${id}`, updateStockDto);
            return response.status === 204 || response.status === 200;
        } catch (error) {
            console.error(`Error updating stock with ID ${id}:`, error);
            throw error;
        }
    },

    // DELETE: /api/Stocks/{id}
    deleteStock: async (id) => {
        try {
            const response = await apiClient.delete(`${BASE_API_URL}/${id}`);
            return response.status === 204 || response.status === 200;
        } catch (error) {
            console.error(`Error deleting stock with ID ${id}:`, error);
            throw error;
        }
    },
};

export default stockService;