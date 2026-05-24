import { apiClient } from "../apiClient";
import { ENDPOINTS } from "../config";

export const notificationsRepository = {
  /**
   * Fetches all notification alerts for the user.
   */
  async getNotifications() {
    return apiClient.get(ENDPOINTS.notifications.list);
  },

  /**
   * Marks a specific notification as read.
   */
  async markAsRead(id) {
    return apiClient.post(ENDPOINTS.notifications.read(id));
  },

  /**
   * Marks all notifications as read.
   */
  async markAllRead() {
    return apiClient.post(ENDPOINTS.notifications.markAllRead);
  },
};
