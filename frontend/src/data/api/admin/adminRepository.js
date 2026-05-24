import { apiClient } from "../apiClient";

export const adminRepository = {
  // Analytics
  getAnalytics: () => apiClient.get("/admin/analytics/"),

  // User Management
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/admin/users/${query ? "?" + query : ""}`);
  },
  toggleUserActive: (userId) => apiClient.post(`/admin/users/${userId}/toggle-active/`),
  changeUserRole: (userId, role) => apiClient.post(`/admin/users/${userId}/change-role/`, { role }),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}/`),

  // AI Usage
  getAIUsageSummary: () => apiClient.get("/admin/ai/summary/"),
  getAIUsageLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/admin/ai/${query ? "?" + query : ""}`);
  },

  // Announcements
  getAnnouncements: () => apiClient.get("/admin/announcements/"),
  createAnnouncement: (data) => apiClient.post("/admin/announcements/", data),
  updateAnnouncement: (id, data) => apiClient.put(`/admin/announcements/${id}/`, data),
  deleteAnnouncement: (id) => apiClient.delete(`/admin/announcements/${id}/`),

  // Content Settings
  getContentSettings: () => apiClient.get("/admin/content-control/"),
  updateContentSettings: (data) => apiClient.post("/admin/content-control/", data),

  // Subscriptions & Billing Approval
  getSubscriptions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/subscriptions/${query ? "?" + query : ""}`);
  },
  approveSubscription: (subId) => apiClient.post(`/subscriptions/${subId}/approve/`),
  cancelSubscription: (subId) => apiClient.post(`/subscriptions/${subId}/cancel/`),
  manualActivateSubscription: (data) => apiClient.post("/subscriptions/manual-activate/", data),

  // Payments
  getPayments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/payments/${query ? "?" + query : ""}`);
  },
  approvePayment: (paymentId) => apiClient.post(`/payments/${paymentId}/approve/`),

  // Plans Management
  createPlan: (data) => apiClient.post("/subscriptions/plans/", data),
  updatePlan: (planId, data) => apiClient.put(`/subscriptions/plans/${planId}/`, data),
  deletePlan: (planId) => apiClient.delete(`/subscriptions/plans/${planId}/`),

  // Workout Catalogs & Templates
  getExercises: () => apiClient.get("/workouts/exercises/"),
  createExercise: (data) => apiClient.post("/workouts/exercises/", data),
  updateExercise: (id, data) => apiClient.put(`/workouts/exercises/${id}/`, data),
  deleteExercise: (id) => apiClient.delete(`/workouts/exercises/${id}/`),

  getWorkoutTemplates: () => apiClient.get("/workouts/"),
  createWorkoutTemplate: (data) => apiClient.post("/workouts/", data),
  updateWorkoutTemplate: (id, data) => apiClient.put(`/workouts/${id}/`, data),
  deleteWorkoutTemplate: (id) => apiClient.delete(`/workouts/${id}/`),

  // Nutrition Templates CRUD
  getNutritionTemplates: () => apiClient.get("/admin/nutrition-templates/"),
  createNutritionTemplate: (data) => apiClient.post("/admin/nutrition-templates/", data),
  updateNutritionTemplate: (id, data) => apiClient.put(`/admin/nutrition-templates/${id}/`, data),
  deleteNutritionTemplate: (id) => apiClient.delete(`/admin/nutrition-templates/${id}/`),
};
