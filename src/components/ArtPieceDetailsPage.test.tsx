import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

import type { ArtPiece } from "../types";
import ArtPieceDetailsPage from "./ArtPieceDetailsPage";

const artPieces: ArtPiece[] = [
  {
    slug: "the-harvesters",
    artist: "Pieter Bruegel the Elder",
    name: "The Harvesters",
    imageSource: "https://example.com/the-harvesters.jpg",
    year: "1565",
    genre: "Renaissance",
  },
  {
    slug: "wheat-field-with-cypresses",
    artist: "Vincent van Gogh",
    name: "Wheat Field with Cypresses",
    imageSource: "https://example.com/wheat-field.jpg",
    year: "1889",
    genre: "Landscape Painting",
  },
];

function renderDetails(slug: string) {
  render(
    <MemoryRouter initialEntries={[`/art-pieces/${slug}`]}>
      <Routes>
        <Route
          path="/art-pieces/:slug"
          element={<ArtPieceDetailsPage artPieces={artPieces} />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ArtPieceDetailsPage", () => {
  it("shows the image of the art piece with the given slug", () => {
    renderDetails("wheat-field-with-cypresses");

    const image = screen.getByRole("img", {
      name: "Wheat Field with Cypresses",
    });
    expect(image).toHaveAttribute("src", artPieces[1].imageSource);
  });

  it("shows the title as a heading", () => {
    renderDetails("wheat-field-with-cypresses");

    expect(
      screen.getByRole("heading", { name: "Wheat Field with Cypresses" })
    ).toBeInTheDocument();
  });

  it("shows the artist, the year and the genre", () => {
    renderDetails("wheat-field-with-cypresses");

    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
    expect(screen.getByText("1889")).toBeInTheDocument();
    expect(screen.getByText("Landscape Painting")).toBeInTheDocument();
  });

  it("does not show another art piece", () => {
    renderDetails("wheat-field-with-cypresses");

    expect(screen.queryByText("The Harvesters")).not.toBeInTheDocument();
  });

  it("shows a back link to the gallery", () => {
    renderDetails("wheat-field-with-cypresses");

    expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute(
      "href",
      "/art-pieces"
    );
  });

  it('shows "Art piece not found" for an unknown slug', () => {
    renderDetails("does-not-exist");

    expect(screen.getByText("Art piece not found")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
