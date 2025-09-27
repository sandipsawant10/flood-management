/* eslint-env vitest */
import { render, screen, fireEvent } from "@testing-library/react";
import PublicNavBar from "../components/Layout/PublicNavBar";
import { MemoryRouter } from "react-router-dom";
import ThemeProvider from "../context/ThemeContext";

describe("Theme toggle", () => {
  it("switches theme class on html element", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <PublicNavBar />
        </ThemeProvider>
      </MemoryRouter>
    );
    const button = screen.getByLabelText(/toggle dark mode/i);
    const wasDark = document.documentElement.classList.contains("dark");
    fireEvent.click(button);
    const isDark = document.documentElement.classList.contains("dark");
    expect(isDark).not.toBe(wasDark);
  });
});
