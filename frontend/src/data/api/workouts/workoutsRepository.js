// src/data/api/workouts/workoutsRepository.js
import { apiClient } from "../apiClient";
import { ENDPOINTS } from "../config";

/**
 * Repository interface mapping Django backend workout logger entries.
 */
export const workoutsRepository = {
  /**
   * Retrieves all logged workouts for the authenticated user.
   */
  async getWorkouts() {
    return apiClient.get(ENDPOINTS.workouts.list);
  },

  /**
   * Logs a new workout entry.
   * @param {Object} workout { exercise, sets, reps, weight }
   */
  async createWorkout(workout) {
    return apiClient.post(ENDPOINTS.workouts.create, workout);
  },

  /**
   * Updates an existing logged workout.
   * @param {string|number} id
   * @param {Object} workout
   */
  async updateWorkout(id, workout) {
    return apiClient.put(ENDPOINTS.workouts.update(id), workout);
  },

  /**
   * Deletes a logged workout record.
   * @param {string|number} id
   */
  async deleteWorkout(id) {
    return apiClient.delete(ENDPOINTS.workouts.delete(id));
  },
};
