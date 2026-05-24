// src/data/api/dashboard/dashboardRepository.js
import { apiClient } from "../apiClient";
import { ENDPOINTS } from "../config";

/**
 * Repository interface mapping Django backend aggregated dashboard statistics & performance charts.
 */
export const dashboardRepository = {
  /**
   * Retrieves summary analytics (volume, workouts count, record achievements).
   */
  async getStatsGrid() {
    return apiClient.get(ENDPOINTS.dashboard.stats);
  },

  /**
   * Retrieves dataset for weekly activity chart bars.
   */
  async getActivityStats() {
    return apiClient.get(ENDPOINTS.dashboard.activity);
  },

  /**
   * Retrieves dataset for the 30-day activity frequency map.
   */
  async getActivityHeatmap() {
    return apiClient.get(ENDPOINTS.dashboard.heatmap);
  },
};
