import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import Navigation from "./Navigation";

function renderNavigation(route: string, favoritesCount = 0) {
  render(
    <MemoryRouter initialEntries={[route]}>
      <Navigation favoritesCount={favoritesCount} />
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

describe("Navigation favorites counter", () => {
  it("shows the number of favorites in the text of the Favorites link", () => {
    renderNavigation("/", 3);

    const link = screen.getByRole("link", { name: "Favorites (3)" });

    expect(link).toHaveAttribute("href", "/favorites");
    expect(link).toHaveTextContent("Favorites (3)");
  });

  it("shows a number with more than one digit", () => {
    renderNavigation("/", 12);

    expect(
      screen.getByRole("link", { name: "Favorites (12)" })
    ).toBeInTheDocument();
  });

  it("is labeled only Favorites when there are no favorites", () => {
    renderNavigation("/", 0);

    const link = screen.getByRole("link", { name: "Favorites" });

    expect(link).toHaveTextContent(/^Favorites$/);
    expect(screen.queryByText(/\(0\)/)).not.toBeInTheDocument();
  });

  it("does not change the other links", () => {
    renderNavigation("/", 5);

    expect(screen.getByRole("link", { name: "Spotlight" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Gallery" })).toBeInTheDocument();
  });

  it("still highlights the Favorites link on /favorites when it shows a number", () => {
    renderNavigation("/favorites", 2);

    const link = screen.getByRole("link", { name: "Favorites (2)" });

    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveClass("active");
  });
});
