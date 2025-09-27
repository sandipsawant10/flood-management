/* eslint-env jest */
import React from "react";
import { render } from "@testing-library/react";
import PublicNavBar from "../components/Layout/PublicNavBar";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";

const Providers = ({ children }) => (
  <MemoryRouter>
    <ThemeProvider>{children}</ThemeProvider>
  </MemoryRouter>
);

describe("PublicNavBar snapshot", () => {
  it("matches snapshot (light)", () => {
    const { asFragment } = render(
      <Providers>
        <PublicNavBar />
      </Providers>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
