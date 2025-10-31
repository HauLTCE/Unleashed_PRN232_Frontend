import { apiClient } from './apiClient';

const BASE_URL = '/Transactions';

interface BulkImportDto {
  providerId: number;
  stockId: number;
  username: string;
  variations: Array<{
    variationId: number;
    quantity: number;
  }>;
}

export const transactionService = {
  /**
   * Creates a bulk stock import transaction.
   * @param importDto - The data for the bulk import.
   */
  async createBulkImport(importDto: BulkImportDto) {
    try {
      const response = await apiClient.post(`${BASE_URL}/bulk-import`, importDto);
      return response.data;
    } catch (error) {
      console.error('Error creating bulk import transaction:', error);
      throw error;
    }
  },
  async getTransactions(params = {}) {
    try {
      const response = await apiClient.get(BASE_URL, { params });
      return response.data; // Expected: PaginatedResult<TransactionCardDTO>
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },
};