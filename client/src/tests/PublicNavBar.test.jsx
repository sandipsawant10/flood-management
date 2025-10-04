/* eslint-env vitest */
import { render, screen, fireEvent } from "@testing-library/react";
import PublicNavBar from "../components/Layout/PublicNavBar";
import { MemoryRouter } from "react-router-dom";
import ThemeProvider from "../contexts/ThemeContext";

const Wrapper = ({ children }) => (
  <MemoryRouter>
    <ThemeProvider>{children}</ThemeProvider>
  </MemoryRouter>
);

describe("PublicNavBar", () => {
  it("renders links", () => {
    render(<PublicNavBar />, { wrapper: Wrapper });
    expect(screen.getByText(/Features/i)).toBeInTheDocument();
  });
  it("toggles mobile menu", () => {
    render(<PublicNavBar />, { wrapper: Wrapper });
    const toggle = screen.getByLabelText(/toggle menu/i);
    fireEvent.click(toggle);
    expect(screen.getAllByText(/Features/i).length).toBeGreaterThan(0);
  });
});
