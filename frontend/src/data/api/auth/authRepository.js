// src/data/api/auth/authRepository.js
import { apiClient } from "../apiClient";
import { ENDPOINTS } from "../config";

/**
 * Repository interface mapping Django backend authentication & profile routes.
 */
export const authRepository = {
  /**
   * Logs in a user with username and password.
   * Returns { success, data: { access, refresh }, message }
   */
  async login(username, password) {
    return apiClient.post(ENDPOINTS.auth.login, { username, password });
  },

  /**
   * Registers a new user.
   * Returns registered user details.
   */
  async register(username, email, password, firstName = "", lastName = "", role = "USER") {
    return apiClient.post(ENDPOINTS.auth.register, {
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      role
    });
  },


  /**
   * Fetches user profile settings.
   */
  async getProfile() {
    return apiClient.get(ENDPOINTS.auth.profile);
  },

  /**
   * Updates user profile configurations.
   */
  async updateProfile(profileData) {
    return apiClient.put(ENDPOINTS.auth.profile, profileData);
  },
};
