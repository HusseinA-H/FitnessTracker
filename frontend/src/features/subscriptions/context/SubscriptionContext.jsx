import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { apiClient } from "@data/api/apiClient";
import { ENDPOINTS } from "@data/api/config";
import { useAuth } from "@features/auth";

const SubscriptionContext = createContext(null);

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN";

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    if (isAdmin) {
      setSubscription({ is_active: true, plan: { name: "Admin", features: { dashboard_access: true } }, features: { dashboard_access: true, ai_limit: -1, workout_limit: -1, feature_flags: { premium_tracker: true, advanced_analytics: true } } });
      setLoading(false);
      return;
    }
    try {
      const response = await apiClient.get(ENDPOINTS.subscriptions.status);
      const data = response?.data || response;
      setSubscription(data);
    } catch {
      setSubscription({ is_active: false, plan: null, features: {} });
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const hasFeature = useCallback(
    (featureName) => {
      if (isAdmin) return true;
      if (!subscription?.is_active) return false;
      const features = subscription?.features || subscription?.plan?.features || {};
      if (features[featureName] === true) return true;
      if (typeof features[featureName] === "number" && features[featureName] > 0) return true;
      const flags = features.feature_flags || {};
      return flags[featureName] === true;
    },
    [subscription, isAdmin]
  );

  const value = useMemo(
    () => ({
      subscription,
      loading,
      hasFeature,
      isActive: isAdmin || subscription?.is_active === true,
      plan: subscription?.plan || null,
      status: subscription?.status || null,
      refresh: fetchSubscription,
    }),
    [subscription, loading, hasFeature, fetchSubscription, isAdmin]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}