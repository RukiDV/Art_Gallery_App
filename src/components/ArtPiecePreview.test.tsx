import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

const artPiece: ArtPiece = {
  slug: "the-harvesters",
  artist: "Pieter Bruegel the Elder",
  name: "The Harvesters",
  imageSource: "https://example.com/the-harvesters.jpg",
  year: "1565",
  genre: "Renaissance",
};

function renderPreview() {
  render(
    <MemoryRouter>
      <ArtPiecePreview
        artPiece={artPiece}
        isFavorite={false}
        onToggleFavorite={() => {}}
      />
    </MemoryRouter>
  );
}

describe("ArtPiecePreview", () => {
  it("shows the image of the art piece", () => {
    renderPreview();

    const image = screen.getByRole("img", { name: "The Harvesters" });
    expect(image).toHaveAttribute("src", artPiece.imageSource);
  });

  it("shows the title", () => {
    renderPreview();

    expect(screen.getByText("The Harvesters")).toBeInTheDocument();
  });

  it("shows the name of the artist", () => {
    renderPreview();

    expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
  });

  it("keeps the favorite button outside of the details link", () => {
    renderPreview();

    expect(screen.getByRole("link")).not.toContainElement(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    );
  });

  it("links to the details page of the art piece", () => {
    renderPreview();

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/art-pieces/the-harvesters"
    );
    expect(screen.getByRole("link")).toHaveTextContent("The Harvesters");
    expect(screen.getByRole("link")).toContainElement(
      screen.getByRole("img", { name: "The Harvesters" })
    );
  });
});
