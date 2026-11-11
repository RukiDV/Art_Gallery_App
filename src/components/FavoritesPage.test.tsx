import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import FavoritesPage from "./FavoritesPage";

const artPieces: ArtPiece[] = [
  {
    slug: "the-harvesters",
    artist: "Pieter Bruegel the Elder",
    name: "The Harvesters",
    imageSource: "https://example.com/the-harvesters.jpg",
    year: "1565",
    genre: "Renaissance",
    colors: ["#37412E", "#8D7332"],
  },
  {
    slug: "wheat-field-with-cypresses",
    artist: "Vincent van Gogh",
    name: "Wheat Field with Cypresses",
    imageSource: "https://example.com/wheat-field.jpg",
    year: "1889",
    genre: "Landscape Painting",
    colors: ["#718F98", "#9DA59E"],
  },
];

function renderFavorites(
  isFavorite: (slug: string) => boolean,
  onToggleFavorite: (slug: string) => void = () => {}
) {
  render(
    <MemoryRouter>
      <FavoritesPage
        artPieces={artPieces}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
    </MemoryRouter>
  );
}

describe("FavoritesPage", () => {
  it("lists only the favorite art pieces", () => {
    renderFavorites((slug) => slug === "wheat-field-with-cypresses");

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Wheat Field with Cypresses")).toBeInTheDocument();
    expect(screen.queryByText("The Harvesters")).not.toBeInTheDocument();
  });

  it("shows the image, the title and the artist of a favorite", () => {
    renderFavorites((slug) => slug === "wheat-field-with-cypresses");

    const image = screen.getByRole("img", {
      name: "Wheat Field with Cypresses",
    });
    expect(image).toHaveAttribute("src", artPieces[1].imageSource);
    expect(
      screen.getByRole("heading", { name: "Wheat Field with Cypresses" })
    ).toBeInTheDocument();
    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
  });

  it("shows an active favorite button on each favorite", () => {
    renderFavorites(() => true);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) =>
      expect(button).toHaveAttribute("aria-pressed", "true")
    );
  });

  it("reports the slug of the art piece when its favorite button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    renderFavorites(() => true, onToggleFavorite);

    await user.click(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    );

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onToggleFavorite).toHaveBeenCalledWith("the-harvesters");
  });

  it('shows "No favorites yet" and no list when nothing is a favorite', () => {
    renderFavorites(() => false);

    expect(screen.getByText("No favorites yet")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});

describe("FavoritesPage: order", () => {
  function renderOrdered(favoriteOrder?: string[]) {
    render(
      <MemoryRouter>
        <FavoritesPage
          artPieces={artPieces}
          isFavorite={() => true}
          onToggleFavorite={() => {}}
          favoriteOrder={favoriteOrder}
        />
      </MemoryRouter>
    );
    return screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
  }

  it("keeps the order of the gallery when no order is given", () => {
    expect(renderOrdered()).toEqual([
      "The Harvesters",
      "Wheat Field with Cypresses",
    ]);
  });

  it("lists the favorites in the order in which they were added", () => {
    expect(
      renderOrdered(["wheat-field-with-cypresses", "the-harvesters"])
    ).toEqual(["Wheat Field with Cypresses", "The Harvesters"]);
  });

  it("puts a favorite that is not in the order at the end", () => {
    expect(renderOrdered(["wheat-field-with-cypresses"])).toEqual([
      "Wheat Field with Cypresses",
      "The Harvesters",
    ]);
  });
});

describe("FavoritesPage: empty state", () => {
  it("shows a decorative empty frame with the message", () => {
    renderFavorites(() => false);

    expect(document.querySelector(".empty-frame")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    expect(screen.getByText("No favorites yet")).toBeInTheDocument();
  });

  it("draws a heart in the frame as an icon, not as a text character", () => {
    renderFavorites(() => false);

    const frame = document.querySelector(".empty-frame");
    expect(frame?.querySelector("svg")).toBeInTheDocument();
    expect(frame).toHaveTextContent("");
  });

  it("offers a link to the gallery", () => {
    renderFavorites(() => false);

    expect(
      screen.getByRole("link", { name: "Browse the gallery" })
    ).toHaveAttribute("href", "/art-pieces");
  });

  it("shows neither the frame nor the link when there are favorites", () => {
    renderFavorites((slug) => slug === "the-harvesters");

    expect(document.querySelector(".empty-frame")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Browse the gallery" })
    ).not.toBeInTheDocument();
  });
});
