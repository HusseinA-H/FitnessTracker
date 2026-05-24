import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { authRepository } from "@data/api/auth/authRepository";
import {
  clearTokens,
  getAccessToken,
  hasRefreshToken,
  refreshTokens,
  setTokens,
  subscribeAuthEvents,
} from "@data/auth/authSession";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const isMounted = useRef(true);

  // Helper to map backend user profile structure to frontend auth state format
  const mapUserProfile = useCallback((profileData) => {
    // If backend wrapped response inside standard success envelope { success, data, message }
    const profile = profileData?.data || profileData;
    if (!profile) return null;

    const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username || "";
    return {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      role: profile.role,
      displayName: displayName,
      first_name: profile.first_name,
      last_name: profile.last_name,
      profile: {
        height: profile.height,
        weight: profile.weight,
        goal_weight: profile.goal_weight,
        fitness_level: profile.fitness_level,
        gender: profile.gender,
        date_of_birth: profile.date_of_birth,
        activity_level: profile.activity_level
      }
    };
  }, []);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initialize auth state: Check refresh token and load user
  useEffect(() => {
    async function initializeAuth() {
      setInitializing(true);
      if (!hasRefreshToken()) {
        if (isMounted.current) {
          setUser(null);
          setLoading(false);
          setInitializing(false);
        }
        return;
      }

      try {
        // Refresh token on start to verify session and obtain new access token
        await refreshTokens({ force: true });

        // Retrieve full profile
        const profileResponse = await authRepository.getProfile();
        const mapped = mapUserProfile(profileResponse);
        if (isMounted.current) setUser(mapped);
      } catch (err) {
        console.warn("Auth initialization failed (session likely expired):", err);
        clearTokens("init_failed");
        if (isMounted.current) setUser(null);
      } finally {
        if (isMounted.current) {
          setLoading(false);
          setInitializing(false);
        }
      }
    }

    initializeAuth();
  }, [mapUserProfile]);

  useEffect(() => {
    return subscribeAuthEvents(async (event) => {
      if (event.type === "logout") {
        setUser(null);
        setAuthError(null);
        setLoading(false);
        return;
      }

      if (event.type === "tokens_updated") {
        if (event.source === "external") {
          try {
            const profileResponse = await authRepository.getProfile();
            const mapped = mapUserProfile(profileResponse);
            setUser(mapped);
          } catch (err) {
            console.warn("Failed to sync profile after token update:", err);
          }
        }
      }
    });
  }, [mapUserProfile]);

  const login = useCallback(async (email, password) => {
    try {
      setAuthError(null);
      setLoading(true);
      const response = await authRepository.login(email, password);
      const tokens = response?.data || response;

      if (!tokens?.access || !tokens?.refresh) {
        throw new Error("Invalid response tokens format from server");
      }

      setTokens({ access: tokens.access, refresh: tokens.refresh }, { context: "login" });

      // Fetch user details
      const profileResponse = await authRepository.getProfile();
      const mapped = mapUserProfile(profileResponse);
      setUser(mapped);
      return mapped;
    } catch (e) {
      setAuthError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [mapUserProfile]);

  const signup = useCallback(async (email, password, name) => {
    try {
      setAuthError(null);
      setLoading(true);
      // Derive a unique username and parse names
      const username = email.split("@")[0] + "_" + Math.random().toString(36).substring(2, 6);
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Register the user
      await authRepository.register(username, email, password, firstName, lastName);

      // Log in after registration
      const authedUser = await login(email, password);
      return authedUser;
    } catch (e) {
      setAuthError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      setAuthError(null);
      // SimpleJWT logout is client-side by purging local tokens (blacklist handled or token cleared)
      clearTokens("logout");
      setUser(null);
    } catch (e) {
      setAuthError(e);
      throw e;
    }
  }, []);

  const updateUserName = useCallback(async (newName) => {
    try {
      setAuthError(null);
      setLoading(true);
      const nameParts = newName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const response = await authRepository.updateProfile({ 
        first_name: firstName, 
        last_name: lastName 
      });
      const mapped = mapUserProfile(response);
      setUser(mapped);
    } catch (e) {
      setAuthError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [mapUserProfile]);

  const changePassword = useCallback(async (newPassword) => {
    try {
      setAuthError(null);
      setLoading(true);
      // Submit password field via profile update
      await authRepository.updateProfile({ password: newPassword });
    } catch (e) {
      setAuthError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const ensureSession = useCallback(async () => {
    if (!hasRefreshToken()) return null;

    try {
      if (!getAccessToken()) {
        await refreshTokens();
      }
      const profileResponse = await authRepository.getProfile();
      const mapped = mapUserProfile(profileResponse);
      setUser(mapped);
      return mapped;
    } catch (err) {
      clearTokens("ensure_session_failed");
      setUser(null);
      throw err;
    }
  }, [mapUserProfile]);

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      signup,
      login,
      logout,
      updateUserName,
      changePassword,
      ensureSession,
      initializing,
    }),
    [user, loading, authError, signup, login, logout, updateUserName, changePassword, ensureSession, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
