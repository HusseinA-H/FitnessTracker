import { apiClient } from "../apiClient";
import { ENDPOINTS } from "../config";

function extractError(err) {
  if (!err) return null;
  const body = err.body || err.response?.data || err.data;
  if (body) {
    if (body.errors?.detail) return { message: body.errors.detail, status: err.status };
    if (body.detail) return { message: body.detail, status: err.status };
    if (body.message) return { message: body.message, status: err.status };
  }
  return { message: err.message || "An error occurred.", status: err.status };
}

export const aiRepository = {
  /**
   * Generates AI personalized health progress insights.
   */
  async getPerformanceInsights() {
    return apiClient.get(ENDPOINTS.ai.performanceInsights);
  },

  /**
   * Retrieves specific exercise recommendations based on user workouts.
   */
  async getWorkoutRecommendations() {
    return apiClient.get(ENDPOINTS.ai.workoutRecommendations);
  },

  /**
   * Generates personalized diet and hydration tips.
   */
  async getNutritionTips() {
    return apiClient.get(ENDPOINTS.ai.nutritionTips);
  },

  /**
   * Lists all conversation threads for the user.
   */
  async getConversations() {
    return apiClient.get(ENDPOINTS.ai.conversations);
  },

  /**
   * Deletes a conversation thread.
   */
  async deleteConversation(id) {
    return apiClient.delete(`${ENDPOINTS.ai.conversations}${id}/`);
  },

  /**
   * Retrieves messages in a specific conversation.
   */
  async getConversationMessages(id) {
    return apiClient.get(`${ENDPOINTS.ai.conversations}${id}/messages/`);
  },

  /**
   * Creates a new conversation thread.
   */
  async createConversation(title = "New Chat") {
    return apiClient.post(ENDPOINTS.ai.conversations, { title });
  },

  /**
   * Sends a prompt and gets the AI reply.
   */
  async sendMessage(conversationId, content) {
    return apiClient.post(ENDPOINTS.ai.messages, { conversation: conversationId, content });
  },
};

export { extractError };