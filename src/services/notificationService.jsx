import { apiClient } from "./ApiClient";

const API_URL = '/Notifications';

/**
 * Corresponds to:
 * GET: api/Notifications
 * public async Task<ActionResult<PagedResponse<NotificationDTO>>> GetNotifications(
 * [FromQuery] int pageNumber = 1,
 * [FromQuery] int pageSize = 10,
 * [FromQuery] string? searchQuery = null,
 * [FromQuery] string? notificationType = null,
 * [FromQuery] bool? isRead = null)
 */
const getAllNotifications = async (page = 1, size = 10, filters = {}) => {
    // filters object can contain: { searchQuery, notificationType, isRead }
    const params = new URLSearchParams({
        pageNumber: page,
        pageSize: size,
    });

    // Conditionally append filters if they are provided
    if (filters.searchQuery) {
        params.append('searchQuery', filters.searchQuery);
    }
    // Check for null/undefined specifically, as `false` is a valid value
    if (filters.isDraft !== null && filters.isDraft !== undefined) {
        params.append('isDraft', filters.isDraft);
    }

    const response = await apiClient.get(`${API_URL}?${params.toString()}`);
    return response.data; // Returns PagedResponse<NotificationDTO>
};

/**
 * Corresponds to:
 * GET: api/Notifications/5
 * public async Task<ActionResult<NotificationDTO>> GetNotification(int id)
 */
const getNotificationById = async (id) => {
    const response = await apiClient.get(`${API_URL}/${id}`);
    return response.data; // Returns NotificationDTO
};

/**
 * Corresponds to:
 * POST: api/Notifications
 * public async Task<ActionResult<NotificationDTO>> PostNotification(CreateNotificationDTO createDto)
 */
const createNotification = async (createDto) => {
    const response = await apiClient.post(`${API_URL}`, createDto); // Removed trailing slash for consistency
    return response.data; // Returns the new NotificationDTO
};

/**
 * Corresponds to:
 * PUT: api/Notifications/5
 * public async Task<IActionResult> PutNotification(int id, UpdateNotificationDTO updateDto)
 */
const updateNotification = async (id, updateDto) => {
    // updateDto is a JS object like { message: "...", isRead: true }
    // This call returns a 204 No Content, so we don't expect data back
    await apiClient.put(`${API_URL}/${id}`, updateDto);
};

/**
 * Corresponds to:
 * DELETE: api/Notifications/5
 * public async Task<IActionResult> DeleteNotification(int id)
 */
const deleteNotification = async (id) => {
    // This call also returns a 204 No Content
    await apiClient.delete(`${API_URL}/${id}`);
};

// Export all functions as a single service object
export const notificationService = {
    getAllNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
};
