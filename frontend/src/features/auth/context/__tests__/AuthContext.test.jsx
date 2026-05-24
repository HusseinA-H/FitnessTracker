import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@data/api/auth/authRepository", () => ({
  authRepository: {
    getProfile: vi.fn(() => ({
      data: {
        id: "user-1",
        username: "tester",
        email: "test@example.com",
        role: "USER",
        first_name: "Test",
        last_name: "User",
      },
    })),
  },
}));

vi.mock("@data/auth/authSession", () => ({
  hasRefreshToken: vi.fn(() => false),
  refreshTokens: vi.fn(),
  clearTokens: vi.fn(),
  subscribeAuthEvents: vi.fn(() => () => {}),
  getAccessToken: vi.fn(),
}));

import { AuthProvider, useAuth } from "../AuthContext";

function Viewer() {
  const { user, loading } = useAuth();
  if (loading) return <div>loading...</div>;
  return <div data-testid="user">{user ? user.email : "null"}</div>;
}

describe("AuthProvider / useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("when no refresh token -> user remains null", async () => {
    render(
      <AuthProvider>
        <Viewer />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("user").textContent).toBe("null")
    );
  });
});
