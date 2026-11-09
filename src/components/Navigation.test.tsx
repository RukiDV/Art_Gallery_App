import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import Navigation from "./Navigation";

function renderNavigation(route: string) {
  render(
    <MemoryRouter initialEntries={[route]}>
      <Navigation />
    </MemoryRouter>
  );
}

describe("Navigation", () => {
  it('shows a "Spotlight" link to the homepage', () => {
    renderNavigation("/");

    expect(screen.getByRole("link", { name: "Spotlight" })).toHaveAttribute(
      "href",
      "/"
    );
  });

  it('shows a "Gallery" link to the gallery', () => {
    renderNavigation("/");

    expect(screen.getByRole("link", { name: "Gallery" })).toHaveAttribute(
      "href",
      "/art-pieces"
    );
  });

  it("highlights only the Spotlight link on /", () => {
    renderNavigation("/");

    const spotlight = screen.getByRole("link", { name: "Spotlight" });
    const gallery = screen.getByRole("link", { name: "Gallery" });

    expect(spotlight).toHaveAttribute("aria-current", "page");
    expect(spotlight).toHaveClass("active");
    expect(gallery).not.toHaveAttribute("aria-current");
    expect(gallery).not.toHaveClass("active");
  });

  it("highlights only the Gallery link on /art-pieces", () => {
    renderNavigation("/art-pieces");

    const spotlight = screen.getByRole("link", { name: "Spotlight" });
    const gallery = screen.getByRole("link", { name: "Gallery" });

    expect(gallery).toHaveAttribute("aria-current", "page");
    expect(gallery).toHaveClass("active");
    expect(spotlight).not.toHaveAttribute("aria-current");
    expect(spotlight).not.toHaveClass("active");
  });
});
