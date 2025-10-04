/* eslint-env jest */
import React from "react";
import { vi, beforeAll, describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "../pages/Auth/Register";
import { ThemeProvider } from "../contexts/ThemeContext";

// Mock toast to avoid side effects
vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: vi.fn(), error: vi.fn() },
  success: vi.fn(),
  error: vi.fn(),
}));

// Mock navigator.geolocation
beforeAll(() => {
  globalThis.navigator = globalThis.navigator || {};
  globalThis.navigator.geolocation = {
    getCurrentPosition: vi.fn(),
  };
});

const renderForm = () =>
  render(
    <MemoryRouter>
      <ThemeProvider>
        <Register />
      </ThemeProvider>
    </MemoryRouter>
  );

describe("Register form validation", () => {
  it("shows required errors when submitting empty form", async () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/district is required/i)).toBeInTheDocument();
      expect(screen.getByText(/state is required/i)).toBeInTheDocument();
    });
  });

  it("validates email format", async () => {
    renderForm();
    fireEvent.input(screen.getByPlaceholderText(/enter your full name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.input(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "invalid-email" },
    });
    fireEvent.input(screen.getByPlaceholderText(/create a password/i), {
      target: { value: "Password1" },
    });
    fireEvent.input(screen.getByPlaceholderText(/your district/i), {
      target: { value: "Some District" },
    });
    fireEvent.change(screen.getByDisplayValue(""), {
      target: { value: "Delhi" },
    }); // state select
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it("validates password complexity", async () => {
    renderForm();
    fireEvent.input(screen.getByPlaceholderText(/enter your full name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.input(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.input(screen.getByPlaceholderText(/create a password/i), {
      target: { value: "password" },
    }); // lacks number & uppercase
    fireEvent.input(screen.getByPlaceholderText(/your district/i), {
      target: { value: "District" },
    });
    fireEvent.change(screen.getByDisplayValue(""), {
      target: { value: "Delhi" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/uppercase, lowercase, and number/i)
      ).toBeInTheDocument();
    });
  });
});
