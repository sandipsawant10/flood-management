/* eslint-env vitest */
import { render, screen } from "@testing-library/react";
import AppLogo from "../components/Branding/AppLogo";

describe("AppLogo", () => {
  it("renders brand text by default", () => {
    render(<AppLogo />);
    expect(screen.getByText(/Aqua Assists/i)).toBeInTheDocument();
  });
  it("hides text when withText=false", () => {
    const { container } = render(<AppLogo withText={false} />);
    expect(container.textContent).toBe("");
  });
});
