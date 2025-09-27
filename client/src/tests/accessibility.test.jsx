/* eslint-env jest */
import React from "react";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import PublicNavBar from "../components/Layout/PublicNavBar";
import Home from "../pages/Home";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";

// matcher added in setupTests.js

const Providers = ({ children }) => (
  <MemoryRouter>
    <ThemeProvider>{children}</ThemeProvider>
  </MemoryRouter>
);

describe("Accessibility", () => {
  it("PublicNavBar has no a11y violations", async () => {
    const { container } = render(
      <Providers>
        <PublicNavBar />
      </Providers>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("Home page has no a11y violations", async () => {
    const { container } = render(
      <Providers>
        <Home />
      </Providers>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
