// src/data/api/progress/progressRepository.js
import { apiClient } from "../apiClient";
import { ENDPOINTS } from "../config";

/**
 * Repository interface mapping Django backend weight & body fat progress tracking log entries.
 */
export const progressRepository = {
  /**
   * Retrieves all progress log entries for the authenticated user.
   */
  async getProgressLogs() {
    return apiClient.get(ENDPOINTS.progress.list);
  },

  /**
   * Creates a new progress log entry.
   * @param {Object} entry { weight, bodyFat, lean, fat, date }
   */
  async createProgressLog(entry) {
    return apiClient.post(ENDPOINTS.progress.create, entry);
  },

  /**
   * Updates an existing progress log entry.
   * @param {string|number} id
   * @param {Object} entry
   */
  async updateProgressLog(id, entry) {
    return apiClient.put(ENDPOINTS.progress.update(id), entry);
  },

  /**
   * Deletes a progress log entry.
   * @param {string|number} id
   */
  async deleteProgressLog(id) {
    return apiClient.delete(ENDPOINTS.progress.delete(id));
  },
};
