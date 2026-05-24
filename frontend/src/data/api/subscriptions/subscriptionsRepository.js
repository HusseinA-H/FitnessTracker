import { apiClient } from "../apiClient";
import { ENDPOINTS } from "../config";

export const subscriptionsRepository = {
  /**
   * Fetches all available subscription plans.
   */
  async getPlans() {
    return apiClient.get(ENDPOINTS.subscriptions.plans);
  },

  /**
   * Retrieves the current user's subscriptions history.
   */
  async getSubscriptions() {
    return apiClient.get(ENDPOINTS.subscriptions.list);
  },

  /**
   * Creates a new subscription request (pending approval).
   */
  async createSubscription(planId) {
    // Send today's date as start_date to prevent validation issues
    const startDate = new Date().toISOString();
    return apiClient.post(ENDPOINTS.subscriptions.list, { plan: planId, start_date: startDate });
  },

  /**
   * Submits payment proof receipt image for subscription approval.
   */
  async createPayment(formData) {
    return apiClient.post(ENDPOINTS.payments.create, formData);
  },
};