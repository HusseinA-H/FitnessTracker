// src/data/api/config.js

/**
 * Reads the environment variable for the Django backend API.
 * Defaults to 'http://localhost:8000/api/v1' for versioned endpoints.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const ENDPOINTS = {
  auth: {
    register: "/auth/register/",
    login: "/auth/login/",
    refresh: "/auth/token/refresh/",
    profile: "/profile/",       // Direct profile routing
    sync: "/auth/sync/",        // Bulk sync if implemented
  },
  workouts: {
    list: "/workouts/",
    create: "/workouts/",
    update: (id) => `/workouts/${id}/`,
    delete: (id) => `/workouts/${id}/`,
    exercises: "/workouts/exercises/", // exercises catalog endpoint
  },
  progress: {
    list: "/progress/",
    create: "/progress/",
    update: (id) => `/progress/${id}/`,
    delete: (id) => `/progress/${id}/`,
  },
  subscriptions: {
    list: "/subscriptions/",
    status: "/subscriptions/status/",
    checkout: "/payments/", // payments is where proof_image upload is posted
    approve: (id) => `/subscriptions/${id}/approve/`,
    plans: "/subscriptions/plans/",
  },
  payments: {
    list: "/payments/",
    create: "/payments/",
    approve: (id) => `/payments/${id}/approve/`,
  },
  notifications: {
    list: "/notifications/",
    read: (id) => `/notifications/${id}/read/`,
    markAllRead: "/notifications/mark-all-read/",
  },
  dashboard: {
    stats: "/dashboard/stats/",
    activity: "/dashboard/activity/",
    heatmap: "/dashboard/heatmap/",
  },
  ai: {
    conversations: "/ai/conversations/",
    messages: "/ai/messages/",
    performanceInsights: "/ai/insights/performance/",
    workoutRecommendations: "/ai/insights/workout-recommendations/",
    nutritionTips: "/ai/insights/nutrition-tips/",
  },
};
