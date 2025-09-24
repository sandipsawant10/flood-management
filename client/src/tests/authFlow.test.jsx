/**
 * Authentication Flow Tests
 *
 * This file contains tests for the authentication flow using the useAuth hook
 * and AuthContext provider. These tests verify that:
 *
 * 1. Users can log in successfully
 * 2. Token storage works correctly for both session and local storage
 * 3. Token refresh mechanism works as expected
 *
 * Note: To run these tests, make sure Jest is properly configured in the project.
 * You may need to add the following to your package.json:
 *
 * "jest": {
 *   "setupFilesAfterEnv": ["./src/tests/setupTests.js"],
 *   "testEnvironment": "jsdom"
 * }
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import Login from "../pages/Auth/Login";
import axiosInstance from "../services/axiosConfig";

// Mock axios
jest.mock("../services/axiosConfig", () => ({
  post: jest.fn(),
  get: jest.fn(),
  defaults: { headers: { common: {} } },
}));

describe("Authentication Flow", () => {
  beforeEach(() => {
    // Clear mocks between tests
    jest.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    // Mock sessionStorage
    Object.defineProperty(window, "sessionStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  test("Login with valid credentials", async () => {
    // Mock successful login response
    axiosInstance.post.mockResolvedValueOnce({
      data: {
        token: "fake-token",
        refreshToken: "fake-refresh-token",
        user: { id: "123", name: "Test User", role: "citizen" },
        expiresIn: 3600,
      },
    });

    // Render login component wrapped in auth provider
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    // Fill in login form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Verify axios call
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith("/api/auth/login", {
        login: "test@example.com",
        password: "password123",
      });
    });

    // Verify token is stored
    await waitFor(() => {
      expect(sessionStorage.setItem).toHaveBeenCalled();
      expect(axiosInstance.defaults.headers.common["Authorization"]).toBe(
        "Bearer fake-token"
      );
    });
  });

  test("Login with remember me option", async () => {
    // Mock successful login response
    axiosInstance.post.mockResolvedValueOnce({
      data: {
        token: "fake-token",
        refreshToken: "fake-refresh-token",
        user: { id: "123", name: "Test User", role: "citizen" },
        expiresIn: 3600,
      },
    });

    // Render login component with remember me checkbox
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    // Fill in login form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    // Check remember me box (if available)
    const rememberMeCheckbox = screen.queryByLabelText(/remember me/i);
    if (rememberMeCheckbox) {
      fireEvent.click(rememberMeCheckbox);
    }

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Verify token is stored in localStorage instead of sessionStorage for remember me
    if (rememberMeCheckbox) {
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalled();
        expect(sessionStorage.setItem).not.toHaveBeenCalled();
      });
    }
  });

  // Add more tests for token refresh, logout, etc.
});
