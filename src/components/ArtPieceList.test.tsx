import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import ArtPieceList from "./ArtPieceList";

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

describe("ArtPieceList", () => {
  it("shows every art piece as an item of a list", () => {
    render(
      <MemoryRouter>
        <ArtPieceList artPieces={artPieces} />
      </MemoryRouter>
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("The Harvesters")).toBeInTheDocument();
    expect(screen.getByText("Wheat Field with Cypresses")).toBeInTheDocument();
  });
});
