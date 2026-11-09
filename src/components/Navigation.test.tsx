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

  it('shows a "Favorites" link to the favorites page after the other links', () => {
    renderNavigation("/");

    const links = screen.getAllByRole("link");

    expect(links.map((link) => link.textContent)).toEqual([
      "Spotlight",
      "Gallery",
      "Favorites",
    ]);
    expect(links[2]).toHaveAttribute("href", "/favorites");
  });

  it("highlights only the Favorites link on /favorites", () => {
    renderNavigation("/favorites");

    const current = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");

    expect(current.map((link) => link.textContent)).toEqual(["Favorites"]);
    expect(current[0]).toHaveClass("active");
  });
});
